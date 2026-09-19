import { waLink } from "@/lib/store";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink("Bonjour Diaby Store, j'ai une question sur vos Crocs.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Contacter Diaby Store sur WhatsApp"
      className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-xl transition-transform hover:scale-110 active:scale-95"
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white" aria-hidden="true">
        <path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.4 1.7 6.3L3 29l6.9-1.8c1.8 1 3.9 1.5 6.1 1.5 7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.6c-2 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.1 1.1-4-.3-.4a10.5 10.5 0 1 1 9.1 5zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.6 8.6 0 0 1-2.5-1.6 9.5 9.5 0 0 1-1.8-2.2c-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6s0-.5 0-.7-.7-1.7-1-2.3-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.2 1.2-1.2 2.8s1.2 3.3 1.4 3.5a13 13 0 0 0 5 4.4c.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.9-.8 2.1-1.5s.3-1.4.2-1.5-.3-.2-.6-.3z" />
      </svg>
    </a>
  );
}
