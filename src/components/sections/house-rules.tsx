import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { houseRules } from "@/data/house-rules";

export function HouseRules() {
  return (
    <section id="rules" className="py-20 px-4 bg-surface-dark">
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-normal"
            style={{
              fontFamily: "var(--font-heading), ui-serif, Georgia, serif",
            }}
          >
            House Rules &amp; FAQ
          </h2>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible>
          {houseRules.map((rule, index) => (
            <AccordionItem key={rule.title} value={`item-${index}`}>
              <AccordionTrigger>{rule.title}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{rule.content}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
