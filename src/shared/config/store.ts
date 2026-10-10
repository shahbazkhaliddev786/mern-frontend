// The store's public contact details, shown on the contact page, in the footer and on the home page.
// mern-backend/knowledge/contact-and-support.md states the same facts for the shopping agent; change both together.
export const STORE_CONTACT = {
    email: 'hello@aljostore.com',
    phone: '+1 (555) 234-5678',
    address: '123 Fifth Avenue, New York, NY',
    hours: 'Mon – Fri, 9am – 6pm EST',
    replyTime: 'one business day'
} as const
