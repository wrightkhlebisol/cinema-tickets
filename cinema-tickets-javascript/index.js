import TicketService from "./src/pairtest/TicketService.js";
import TicketTypeRequest from "./src/pairtest/lib/TicketTypeRequest.js";


let ticketPurchase = new TicketService();
let request = [new TicketTypeRequest('INFANT', 1), new TicketTypeRequest('ADULT', 1), new TicketTypeRequest('CHILD', 0)]
console.log(ticketPurchase.purchaseTickets(1, request))
console.log(ticketPurchase.purchaseTickets(1, new TicketTypeRequest('ADULT', 20)))
// console.log(ticketPurchase.purchaseTickets(1, new TicketTypeRequest()))
// console.log(ticketPurchase.purchaseTickets(1, [null]))
