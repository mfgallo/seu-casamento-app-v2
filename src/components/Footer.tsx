import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { EditableText } from "@/components/EditableText";

// Mesmas chaves do Header (src/components/Header.tsx) - editar um label aqui
// via admin atualiza o link nos dois lugares.
const footerNavLinks = [
  { to: "/", key: "nav.home", label: "Home" },
  { to: "/servicos", key: "nav.servicos", label: "Serviços" },
  { to: "/galeria", key: "nav.galeria", label: "Galeria" },
  { to: "/sobre", key: "nav.sobre", label: "Sobre" },
  { to: "/depoimentos", key: "nav.depoimentos", label: "Depoimentos" },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-serif text-xl font-semibold text-foreground">
              <EditableText contentKey="footer.brand_name" defaultValue="Ateliê do Sim" />
            </h3>
            <EditableText
              as="p"
              contentKey="footer.tagline"
              defaultValue="Assessoria completa para casamentos inesquecíveis. Cuidamos de cada detalhe para que você viva cada momento."
              className="mt-3 max-w-xs text-sm text-muted-foreground"
              multiline
            />
          </div>

          <div>
            <EditableText
              as="h4"
              contentKey="footer.nav_heading"
              defaultValue="Navegação"
              className="text-sm font-semibold uppercase tracking-wider text-foreground"
            />
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {footerNavLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-primary">
                    <EditableText contentKey={link.key} defaultValue={link.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <EditableText
              as="h4"
              contentKey="footer.contact_heading"
              defaultValue="Contato"
              className="text-sm font-semibold uppercase tracking-wider text-foreground"
            />
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <EditableText contentKey="footer.email" defaultValue="contato@ateledosim.com.br" />
              </li>
              <li>
                <EditableText contentKey="footer.phone" defaultValue="+55 (11) 99999-9999" />
              </li>
              <li>
                <EditableText contentKey="footer.address" defaultValue="São Paulo, SP" />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {currentYear}{" "}
            <EditableText
              contentKey="footer.copyright_suffix"
              defaultValue="Ateliê do Sim. Todos os direitos reservados."
            />
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <EditableText contentKey="footer.made_with_prefix" defaultValue="Feito com" />
            <Heart className="h-3 w-3 fill-primary text-primary" />
            <EditableText contentKey="footer.made_with_suffix" defaultValue="para noivos felizes" />
          </p>
        </div>
      </div>
    </footer>
  );
}
