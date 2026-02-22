import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export async function compressImage(
    uri: string,
    maxWidth: number = 1200,
    quality: number = 0.8
): Promise<string> {
    const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: maxWidth } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
}

export async function validateKycImage(
    uri: string
): Promise<{ valid: boolean; error?: string }> {
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
            return { valid: false, error: "L'image n'existe pas." };
        }

        // size in bytes
        if (fileInfo.size < 100 * 1024) { // < 100KB
            return { valid: false, error: "Image trop petite, elle pourrait être floue." };
        }

        if (fileInfo.size > 10 * 1024 * 1024) { // > 10MB
            return { valid: false, error: "Image trop grande (max 10MB)." };
        }

        return { valid: true };
    } catch (e) {
        return { valid: false, error: "Impossible de valider l'image." };
    }
}

export async function uriToBase64(uri: string): Promise<string> {
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}
