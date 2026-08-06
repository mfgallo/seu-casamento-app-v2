import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { EditableText } from "@/components/EditableText";

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
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Navegação
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="transition-colors hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="transition-colors hover:text-primary">
                  Serviços
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="transition-colors hover:text-primary">
                  Galeria
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="transition-colors hover:text-primary">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/depoimentos" className="transition-colors hover:text-primary">
                  Depoimentos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Contato
            </h4>
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
            © {currentYear} Ateliê do Sim. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            Feito com <Heart className="h-3 w-3 fill-primary text-primary" /> para noivos felizes
          </p>
        </div>
      </div>
    </footer>
  );
}
