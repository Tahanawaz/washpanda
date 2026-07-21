import { Contact } from "../models/Contact.js";
import { cleanEmail, cleanPhone, cleanText, isHoneypotFilled } from "../utils/validation.js";

export async function createContact(request, response, next) {
  try {
    if (isHoneypotFilled(request.body)) {
      return response.status(201).json({ success: true, message: "Message sent successfully" });
    }
    const contact = await Contact.create({
      name: cleanText(request.body.name, { field: "Name", min: 2, max: 120 }),
      email: cleanEmail(request.body.email),
      phone: cleanPhone(request.body.phone),
      message: cleanText(request.body.message, { field: "Message", min: 10, max: 2000 }),
    });
    response.status(201).json({ success: true, message: "Message sent successfully", data: contact });
  } catch (error) {
    next(error);
  }
}

export async function getContacts(_request, response, next) {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    response.json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    next(error);
  }
}

export async function updateContact(request, response, next) {
  try {
    const contact = await Contact.findByIdAndUpdate(request.params.id, { status: request.body.status }, { new: true, runValidators: true });
    if (!contact) return response.status(404).json({ success: false, message: "Contact message not found" });
    response.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
}

export async function markContactNotificationSeen(request, response, next) {
  try {
    const contact = await Contact.findByIdAndUpdate(
      request.params.id,
      { notificationSeen: true },
      { new: true },
    );
    if (!contact) return response.status(404).json({ success: false, message: "Contact message not found" });
    response.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
}
