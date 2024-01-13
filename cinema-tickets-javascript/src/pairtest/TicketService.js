import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */


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
    } catch (error) {
      throw new InvalidPurchaseException(error.message)
    }

  }
}
