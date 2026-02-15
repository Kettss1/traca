import { Vibrant } from 'node-vibrant/node'

export interface ExtractedColors {
  primary: string
  secondary: string
}

export async function extractColorsFromImage(imageUrl: string): Promise<ExtractedColors | null> {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette()

    // Prefer Vibrant, fallback to Muted, then DarkVibrant
    const primary =
      palette.Vibrant?.hex || palette.Muted?.hex || palette.DarkVibrant?.hex || '#2D3748'

    const secondary =
      palette.LightVibrant?.hex || palette.LightMuted?.hex || palette.DarkMuted?.hex || '#718096'

    return { primary, secondary }
  } catch (error) {
    console.error('Error extracting colors from image:', error)
    return null
  }
}
