import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }

    try {
        const { userId, title, body, data } = await req.json()

        // Vérifier que l'appelant est admin via le JWT
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response('Non autorisé', { status: 401 })
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        // Optionnel : vérifier explicitement si l'utilisateur qui appelle a `est_admin=true`
        // const { data: callerUser, error: callerError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        // Puis fetch 'utilisateurs' pour s'assurer que est_admin est vrai.

        // Récupérer le push_token de l'utilisateur visé
        const { data: userTarget } = await supabase
            .from('utilisateurs')
            .select('push_token')
            .eq('id_utilisateur', userId)
            .single()

        if (!userTarget?.push_token) {
            return new Response('No push token found for user', { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } })
        }

        // Envoyer via l'API Expo Push
        const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: userTarget.push_token,
                title,
                body,
                data,
                sound: 'default'
            })
        })

        const expoResultData = await expoRes.json()

        return new Response(JSON.stringify({ success: true, expoResult: expoResultData }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })

    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
    }
})
