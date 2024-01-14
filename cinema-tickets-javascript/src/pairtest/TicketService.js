import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */
  // #ticketPaymentService;
  // #seatReservationService;
  #childPrice = 1000;
  #adultPrice = 2000;

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

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    try {
      const ticketTypeObjs = ticketTypeRequests[0]
      this.#validateParams(accountId, ticketTypeObjs);
      const requestQuantityObject = this.#aggregateRequest(ticketTypeObjs)
      this.#validateTicketType(requestQuantityObject);
      this.#validateQuantity(requestQuantityObject);

      let { quantity, amount, seats } = this.#getQuantityAmountAndSeats(requestQuantityObject);

      // Make payment request first then seatreservation request
      this.ticketPaymentService.makePayment(accountId, amount);
      this.seatReservationService.reserveSeat(accountId, seats);
      return { quantity, amount, seats };
    } catch (error) {
      throw new InvalidPurchaseException(error.message);
    }
  }

  #validateParams(accountId, ticketTypes) {
    if (accountId <= 0 || typeof accountId !== "number") {
      throw new RangeError("Account ID should be an integer greater than zero");
    }
    if (!ticketTypes || ticketTypes.length === 0) {
      throw new Error("Ticket type is required");
    }
    if (Array.isArray(ticketTypes[0]) || ticketTypes[0] === null) {
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

  #validateQuantity(ticketRequestObj) {
    if (ticketRequestObj.quantity < 1 || ticketRequestObj.quantity > 20) {
      throw new RangeError("Quantity should be between 1 and 20");
    }
  }

  #getQuantityAmountAndSeats(requestQuantityObj) {
    let amount = (requestQuantityObj['adult'] * this.#adultPrice) + (requestQuantityObj['child'] * this.#childPrice);
    let seats = requestQuantityObj['adult'] + requestQuantityObj['child'];
    return { quantity: requestQuantityObj.quantity, amount, seats };
  }

  #aggregateRequest(ticketRequestObj) {
    const requestQuantityObj = {
      adult: 0,
      child: 0,
      infant: 0,
      quantity: 0
    };

    if (!Array.isArray(ticketRequestObj)) {
      let noOfTickets = ticketRequestObj.getNoOfTickets()
      let ticketType = ticketRequestObj.getTicketType().toLowerCase()

      requestQuantityObj[ticketType] = noOfTickets;
      requestQuantityObj.quantity = noOfTickets;
    } else {
      ticketRequestObj.forEach(request => {

        const ticketType = request.getTicketType();
        requestQuantityObj.quantity += request.getNoOfTickets();

        if (ticketType === 'ADULT') {
          requestQuantityObj.adult += request.getNoOfTickets();
        } else if (ticketType === 'CHILD') {
          requestQuantityObj.child += request.getNoOfTickets();
        } else {
          requestQuantityObj.infant += request.getNoOfTickets();
        }
      });

    }

    return requestQuantityObj;
  }
}
