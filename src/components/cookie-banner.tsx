import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent, type ConsentLevel } from "@/lib/cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (level: ConsentLevel) => {
    setConsent(level);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl p-5">
        <h2 className="font-display text-lg">Votre vie privée</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Nous utilisons des cookies et du stockage local. Les cookies <strong>essentiels</strong> servent
          uniquement à vous garder connecté·e et à mémoriser votre progression de lecture. Les autres (mesure
          d'audience, préférences non indispensables) ne sont déposés qu'avec votre accord. Vous pouvez changer
          d'avis à tout moment depuis « Paramètres » de votre compte.
        </p>
        {details && (
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li><strong className="text-foreground">Essentiels</strong> — session de connexion, progression de lecture, choix de cookies. Toujours actifs si vous acceptez, jamais utilisés à des fins publicitaires.</li>
            <li><strong className="text-foreground">Mesure &amp; confort</strong> — statistiques d'usage anonymisées et préférences d'affichage. Uniquement avec « Tout accepter ».</li>
            <li><strong className="text-foreground">Refus</strong> — aucun stockage persistant : vous restez connecté·e le temps de l'onglet seulement.</li>
          </ul>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => choose("all")} className="bg-cream text-cream-foreground hover:bg-cream/90">
            Tout accepter
          </Button>
          <Button size="sm" variant="outline" onClick={() => choose("essential")}>
            Cookies essentiels
          </Button>
          <Button size="sm" variant="ghost" onClick={() => choose("refused")}>
            Refuser
          </Button>
          <button
            onClick={() => setDetails((d) => !d)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
          >
            {details ? "Masquer le détail" : "En savoir plus"}
          </button>
        </div>
      </div>
    </div>
  );
}