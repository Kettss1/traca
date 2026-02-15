// Shelf themes configuration
export interface ShelfTheme {
  id: string
  name: string
  description: string
  shelfBoard: string // CSS gradient for shelf board
  shelfBack: string // CSS gradient for shelf back
  shelfBracket: string // CSS gradient for brackets
  textColor: string // Text color on shelf
  isDefault?: boolean
  unlockCondition?: string // For future gamification
}

export const shelfThemes: ShelfTheme[] = [
  {
    id: 'classic-wood',
    name: 'Madeira Clássica',
    description: 'Estante de madeira clara tradicional',
    shelfBoard: 'linear-gradient(180deg, #8B7355 0%, #6B5A47 50%, #5D4E3C 100%)',
    shelfBack: 'linear-gradient(180deg, #5D4E3C 0%, #3D3228 100%)',
    shelfBracket: 'linear-gradient(180deg, #5D4E3C 0%, #3D3228 100%)',
    textColor: 'rgba(255, 248, 240, 0.6)',
    isDefault: true,
  },
  {
    id: 'dark-wood',
    name: 'Madeira Escura',
    description: 'Estante de madeira nobre escura',
    shelfBoard: 'linear-gradient(180deg, #4A3728 0%, #3D2E22 50%, #2D221A 100%)',
    shelfBack: 'linear-gradient(180deg, #2D221A 0%, #1A1512 100%)',
    shelfBracket: 'linear-gradient(180deg, #2D221A 0%, #1A1512 100%)',
    textColor: 'rgba(255, 248, 240, 0.5)',
  },
  {
    id: 'white-minimal',
    name: 'Minimalista Branco',
    description: 'Estante moderna e clean',
    shelfBoard: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 50%, #EBEBEB 100%)',
    shelfBack: 'linear-gradient(180deg, #F8F8F8 0%, #EEEEEE 100%)',
    shelfBracket: 'linear-gradient(180deg, #E0E0E0 0%, #CCCCCC 100%)',
    textColor: 'rgba(45, 42, 38, 0.5)',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    description: 'Metal e concreto urbano',
    shelfBoard: 'linear-gradient(180deg, #5C5C5C 0%, #4A4A4A 50%, #3D3D3D 100%)',
    shelfBack: 'linear-gradient(180deg, #3D3D3D 0%, #2A2A2A 100%)',
    shelfBracket: 'linear-gradient(180deg, #6B6B6B 0%, #4A4A4A 100%)',
    textColor: 'rgba(255, 255, 255, 0.5)',
  },
  {
    id: 'rose-floral',
    name: 'Rosa Floral',
    description: 'Delicado e romântico',
    shelfBoard: 'linear-gradient(180deg, #E8B4B8 0%, #D4A0A4 50%, #C08B8F 100%)',
    shelfBack: 'linear-gradient(180deg, #D4A0A4 0%, #B88B8F 100%)',
    shelfBracket: 'linear-gradient(180deg, #C08B8F 0%, #A87579 100%)',
    textColor: 'rgba(255, 255, 255, 0.7)',
  },
  {
    id: 'fantasy',
    name: 'Fantasia',
    description: 'Mágico e misterioso',
    shelfBoard: 'linear-gradient(180deg, #4A3B6B 0%, #3D3158 50%, #2E2545 100%)',
    shelfBack: 'linear-gradient(180deg, #2E2545 0%, #1E1830 100%)',
    shelfBracket: 'linear-gradient(180deg, #5A4A7B 0%, #4A3B6B 100%)',
    textColor: 'rgba(220, 200, 255, 0.6)',
    unlockCondition: 'Leia 10 livros de fantasia',
  },
]

export function getShelfTheme(themeId: string | null | undefined): ShelfTheme {
  return shelfThemes.find((t) => t.id === themeId) || shelfThemes[0]
}
