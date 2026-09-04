# React

Functional components only.

Server Components unless interactivity is required.

UI components call well-named server operations. They do not implement database, Twilio, or authorization logic.

Keep Client Components small. Extract interactive bits instead of marking a whole page as client.

Do not introduce Redux or other global client stores.

Use descriptive names (`createAppointment`, `getAvailableSlots`). Avoid `doThing`, `handleData`, `utils`, `helper`.
