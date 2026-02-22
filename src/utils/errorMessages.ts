
export function getErrorMessage(error: string): string {
    if (error.includes('Invalid login credentials')) {
        return 'Numéro ou mot de passe incorrect';
    }
    if (error.includes('User already registered') || error.includes('already registered')) {
        return 'Ce numéro est déjà utilisé';
    }
    if (error.includes('Password should be at least')) {
        return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (error.includes('Network request failed') || error.includes('fetch failed')) {
        return 'Vérifiez votre connexion internet';
    }
    return `Une erreur est survenue: ${error}`;
}
