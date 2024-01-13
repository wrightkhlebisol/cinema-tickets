import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */
  #childPrice = 10.0;
  #adultPrice = 20.0;

  get childPrice() {
    return this.#childPrice;
  }

  get adultPrice() {
    return this.#adultPrice;
  }

  #validateTicketType(ticketRequestObj) {
    let { adult, child, infant } = ticketRequestObj[0];
    if ((infant > 0 || child > 0) && adult <= 0) {
      throw new EvalError("Child and infant tickets can only be purchased with an adult present")
    }

    if (infant > adult) {
      throw new EvalError("Infants cannot be more than adults")
    }
  }

  #getQuantity(ticketRequestObj) {
    let ticketsCount = Object.values(ticketRequestObj[0]);

    let quantity = ticketsCount.reduce((total, eachTypeCount) => {
      return total + eachTypeCount
    }, 0)
    if (quantity < 1 || quantity > 20) {
      throw new RangeError("Quantity should be between 1 and 20")
    }
    return quantity;
  }

  #validateParams(accountId, ticketTypes) {
    if (accountId <= 0 || typeof accountId !== 'number') {
      throw new RangeError("Account ID should be an integer greater than zero")
    }

    if (ticketTypes[0] === undefined || Object.keys(ticketTypes[0]).length === 0) {
      throw new SyntaxError("Ticket type is required")
    }

    if (typeof ticketTypes[0] !== 'object' || Array.isArray(ticketTypes[0])) {
      throw new SyntaxError("Ticket type should be a non empty object")
    }
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    try {
      this.#validateParams(accountId, ticketTypeRequests)
      this.#validateTicketType(ticketTypeRequests)
      let ticketQuantity = this.#getQuantity(ticketTypeRequests)
      console.log(ticketQuantity)
    } catch (error) {
      throw new InvalidPurchaseException(error.message)
    }

  }
}
