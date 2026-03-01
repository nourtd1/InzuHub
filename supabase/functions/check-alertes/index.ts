import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req: Request) => {
    const payload = await req.json()
    const newProperty = payload.record

    // Ignorer si pas disponible
    if (newProperty.statut !== 'disponible') {
        return new Response('Ignored', { status: 200 })
    }

    const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer toutes les alertes actives qui matchent
    const { data: alertes } = await supabase
        .from('alertes')
        .select('*, utilisateurs(push_token)')
        .eq('est_active', true)
        .neq('id_utilisateur', newProperty.id_utilisateur)

    for (const alerte of alertes ?? []) {
        // Vérifier les critères
        const matches = checkAlerteCriteria(alerte, newProperty)
        if (!matches) continue

        // Vérifier si déjà notifié pour cette propriété
        // Type the result explicitly to avoid any weird generic TS errors inside Deno
        const { data: existing } = await supabase
            .from('alertes_historique')
            .select('id')
            .eq('id_alerte', alerte.id_alerte)
            .eq('id_propriete', newProperty.id_propriete)
            .maybeSingle()

        if (existing) continue

        // Envoyer la notification push via Expo
        // @ts-ignore Since relations returned by select(*) might not infer perfectly without typing setup
        const pushToken = alerte.utilisateurs?.push_token
        if (pushToken) {
            await sendExpoPushNotification(pushToken, {
                title: '🏠 Nouvelle annonce correspond à votre alerte !',
                body: `${newProperty.titre} - ${formatPrix(newProperty.prix_mensuel)} RWF/mois`,
                data: {
                    propertyId: newProperty.id_propriete,
                    alerteId: alerte.id_alerte,
                    type: 'new_property_alert'
                }
            })
        }

        // Enregistrer dans l'historique
        await supabase.from('alertes_historique').insert({
            id_alerte: alerte.id_alerte,
            id_propriete: newProperty.id_propriete
        })

        // Mettre à jour derniere_notif
        await supabase
            .from('alertes')
            .update({ derniere_notif: new Date().toISOString() })
            .eq('id_alerte', alerte.id_alerte)
    }

    return new Response('OK', { status: 200 })
})

function checkAlerteCriteria(alerte: any, property: any): boolean {
    if (alerte.id_quartier &&
        alerte.id_quartier !== property.id_quartier) return false
    if (alerte.prix_max &&
        property.prix_mensuel > alerte.prix_max) return false
    if (alerte.prix_min &&
        property.prix_mensuel < alerte.prix_min) return false
    if (alerte.nombre_chambres &&
        property.nombre_chambres < alerte.nombre_chambres) return false
    if (alerte.has_eau === true &&
        !property.has_eau) return false
    if (alerte.has_electricite === true &&
        !property.has_electricite) return false
    return true
}

async function sendExpoPushNotification(
    token: string,
    notification: any
) {
    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            to: token,
            title: notification.title,
            body: notification.body,
            data: notification.data,
            sound: 'default',
            priority: 'high'
        })
    })
}

function formatPrix(amount: number): string {
    return new Intl.NumberFormat('fr-RW').format(amount)
}
