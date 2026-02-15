import EmailInput from './email-input'

export default function HeroSection() {
  return (
    <div className="flex flex-col items-center">
      <div>
        <h1 className="text-green-deep font-fraunces text-4xl font-bold">
          Sua estante digital com <span className="text-terracotta">alma brasileira</span>
        </h1>
        <p className="text-green-light font-source-sans-3">
          Organize suas leituras, descubra novos livros e conecte-se com leitores como você.
          Simples, bonito e feito pra quem lê de verdade.
        </p>
      </div>
      <EmailInput />
    </div>
  )
}
