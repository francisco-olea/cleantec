import Image from "next/image"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="/images/cleantec-logo.png"
              alt="Clean Tec Logo"
              width={120}
              height={120}
              className="object-contain"
            />
            <p className="text-sm text-muted-foreground">
              Proveedor líder de suministros de limpieza profesional. Calidad garantizada para mantener tus espacios
              impecables.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">+52 653 130 1130</p>
                  <p className="text-sm text-muted-foreground">+52 653 130 1131</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">ventas@clean-tec.com.mx</p>
                  <p className="text-sm text-muted-foreground">info@clean-tec.com.mx</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Ubicación</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">Cjon Revolución y 4ta</p>
                  <p className="text-sm text-muted-foreground">San Luis RC, Sonora</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Horario de Atención</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Lunes a Viernes</p>
                  <p className="text-sm text-muted-foreground">8:00 AM - 5:00 PM</p>
                  <p className="text-sm font-medium mt-2">Sábados</p>
                  <p className="text-sm text-muted-foreground">8:00 AM - 12:00 PM</p>
                  <p className="text-sm font-medium mt-2">Domingos</p>
                  <p className="text-sm text-muted-foreground">Cerrado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Clean Tec. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidad
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Realizado por{" "}
              <a
                href="https://fangosystems.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline transition-colors"
              >
                Fango Systems
              </a>{" "}
              2026
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
