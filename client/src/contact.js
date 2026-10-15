// Read the form before navigation removes its inputs from the page.
export function captureContact(formData) {
  return Object.fromEntries(
    ["firstName", "lastName", "email", "phone", "message"].map((name) => [
      name,
      String(formData.get(name) ?? "").trim(),
    ]),
  );
}
