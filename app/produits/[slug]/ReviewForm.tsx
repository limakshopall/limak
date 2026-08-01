// ============================================================
//  FORMULAIRE D'AVIS — Client Component (interactif)
//  Étoiles cliquables + commentaire. Réservé aux clients connectés.
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Show, SignInButton } from "@clerk/nextjs";
import { submitReview } from "./review-actions";

export default function ReviewForm({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; texte: string } | null>(null);

  async function handleSubmit() {
    if (rating < 1) {
      setMessage({ type: "error", texte: "Choisissez une note en cliquant sur les étoiles." });
      return;
    }
    setSending(true);
    setMessage(null);
    const res = await submitReview({ productId, slug, rating, comment });
    setSending(false);

    if (res.ok) {
      setMessage({ type: "ok", texte: "Merci, votre avis a été enregistré !" });
      router.refresh(); // recharge la liste des avis
    } else {
      setMessage({ type: "error", texte: res.error });
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/15 dark:bg-[#05070d]">
      {/* Non connecté : invitation à se connecter */}
      <Show when="signed-out">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <SignInButton mode="modal">
            <button className="font-medium text-black underline dark:text-gray-300">Connectez-vous</button>
          </SignInButton>{" "}
          pour laisser un avis.
        </p>
      </Show>

      {/* Connecté : le formulaire */}
      <Show when="signed-in">
        <h3 className="font-semibold">Donnez votre avis</h3>

        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="text-2xl leading-none"
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
            >
              <span className={(hover || rating) >= n ? "text-orange-500" : "text-gray-300"}>
                ★
              </span>
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Votre commentaire (facultatif)"
          rows={3}
          className="mt-3 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-white/15"
        />

        <button
          onClick={handleSubmit}
          disabled={sending}
          className="mt-3 rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {sending ? "Envoi…" : "Publier mon avis"}
        </button>

        {message && (
          <p className={`mt-2 text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>
            {message.texte}
          </p>
        )}
      </Show>
    </div>
  );
}