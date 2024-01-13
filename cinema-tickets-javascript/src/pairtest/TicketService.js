import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  #validateTicketType(ticketRequestObj) {
    let { adult, child, infant } = ticketRequestObj[0];
    if ((infant > 0 || child > 0) && adult <= 0) {
      throw new EvalError("Child and infant tickets can only be purchased with an adult present")
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
    if (accountId <= 0) {
      throw new RangeError("Account ID should be greater than zero")
    }

    if (ticketTypes[0] === undefined || Object.keys(ticketTypes[0]).length === 0) {
      throw new SyntaxError("Ticket type is required")
    }
    return true;
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    try {
      this.#validateParams(accountId, ticketTypeRequests)
      this.#validateTicketType(ticketTypeRequests)
      let ticketQuantity = this.#getQuantity(ticketTypeRequests)
    } catch (error) {
      throw new InvalidPurchaseException(error.message)
    }

  }
}
