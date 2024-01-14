import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */
  #childPrice = 10.0;
  #adultPrice = 20.0;
  #requestQuantityObj = {
    adult: 0,
    child: 0,
    infant: 0
  };

  constructor(
    ticketPaymentService = new TicketPaymentService(),
    seatReservationService = new SeatReservationService()
  ) {
    this.ticketPaymentService = ticketPaymentService;
    this.seatReservationService = seatReservationService;
  }

  get childPrice() {
    return this.#childPrice;
  }

  get adultPrice() {
    return this.#adultPrice;
  }

  #validateParams(accountId, ticketTypes) {
    if (accountId <= 0 || typeof accountId !== "number") {
      throw new RangeError("Account ID should be an integer greater than zero");
    }
    if (!ticketTypes) {
      throw new Error("Ticket type is required");
    }

    if (Array.isArray(ticketTypes[0])) {
      throw new TypeError("Ticket type should be a non empty object");
    }
  }

  #validateTicketType(ticketRequestObj) {
    let { adult, child, infant } = ticketRequestObj;
    if ((infant > 0 || child > 0) && adult <= 0) {
      throw new EvalError(
        "Child and infant tickets can only be purchased with an adult present"
      );
    }

    if (infant > adult) {
      throw new EvalError("Infants cannot be more than adults");
    }
  }

  #getQuantityAmountAndSeats(ticketRequestObj) {
    let quantity

    if (!Array.isArray(ticketRequestObj)) {
      let ticketType = ticketRequestObj.getTicketType().toLowerCase()
      this.#requestQuantityObj[ticketType] = ticketRequestObj.getNoOfTickets();
      quantity = ticketRequestObj.getNoOfTickets();
    } else {
      this.#requestQuantityObj = this.#aggregateRequestQuantity(ticketRequestObj);

      quantity = ticketRequestObj.reduce((total, eachTypeCount) =>
        total + eachTypeCount.getNoOfTickets(), 0);
    }

    this.#validateTicketType(this.#requestQuantityObj);

    if (quantity < 1 || quantity > 20) {
      throw new RangeError("Quantity should be between 1 and 20");
    }

    let amount = (this.#requestQuantityObj['adult'] * this.#adultPrice) + (this.#requestQuantityObj['child'] * this.#childPrice);
    let seats = this.#requestQuantityObj['adult'] + this.#requestQuantityObj['child'];
    return { quantity, amount, seats };
  }

  #aggregateRequestQuantity(ticketRequestObj) {
    ticketRequestObj.forEach(request => {
      const ticketType = request.getTicketType();
      if (ticketType === 'ADULT') {
        this.#requestQuantityObj.adult += request.getNoOfTickets();
      } else if (ticketType === 'CHILD') {
        this.#requestQuantityObj.child += request.getNoOfTickets();
      } else {
        this.#requestQuantityObj.infant += request.getNoOfTickets();
      }
    });
    return this.#requestQuantityObj;
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    try {
      this.#validateParams(accountId, ticketTypeRequests[0]);
      let { quantity, amount, seats } = this.#getQuantityAmountAndSeats(ticketTypeRequests[0]);

      // Make payment request first then seatreservation request
      this.ticketPaymentService.makePayment(accountId, amount);
      this.seatReservationService.reserveSeat(accountId, seats);
      return { quantity, amount, seats };
    } catch (error) {
      throw new InvalidPurchaseException(error.message);
    }
  }
}
