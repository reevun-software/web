import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  {
    q: "Нужно ли самому размещать бота на сервере?",
    a: "Нет. Бот работает на нашей инфраструктуре — вам нужно только добавить его на свой Discord-сервер и войти в панель тем же аккаунтом.",
  },
  {
    q: "Кто видит семью в панели управления?",
    a: "Только участники с правом «Управление сервером» или правами администратора на этом Discord-сервере. Остальные участники панель не видят.",
  },
  {
    q: "Можно управлять несколькими серверами из одного аккаунта?",
    a: "Да. Reevun изначально спроектирован под несколько семей: один Discord-аккаунт переключается между всеми серверами, где у вас есть права и установлен бот.",
  },
  {
    q: "Нужен ли отдельный пароль для панели?",
    a: "Нет, вход только через Discord OAuth. Отдельного пароля для сайта не существует.",
  },
];

export function Faq() {
  return (
    <Accordion multiple={false} className="w-full">
      {FAQ.map((item) => (
        <AccordionItem key={item.q} value={item.q}>
          <AccordionTrigger className="text-left text-base font-medium">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
