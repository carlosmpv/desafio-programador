"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TranscriptionPoller({ id }: { id: string }) {
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;

        async function poll() {
            for (let attempt = 0; !cancelled && attempt < 60; attempt += 1) {
                try {
                    const res = await fetch(`/api/transcricoes/${id}`, { cache: "no-store" });
                    if (res.status === 200) {
                        router.refresh();
                        return;
                    }
                    if (res.status !== 202) {
                        // On unexpected status, refresh to surface error state
                        router.refresh();
                        return;
                    }
                } catch (err) {
                    // network error: try again a few times then refresh to show error
                    console.error(err);
                    router.refresh();
                    return;
                }

                await new Promise((r) => setTimeout(r, 1500));
            }
        }

        poll();

        return () => {
            cancelled = true;
        };
    }, [id, router]);

    return null;
}
