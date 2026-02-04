import { Star, MapPin, Heart } from 'lucide-react';
import { Link } from '@/navigation';

interface SitterCardProps {
  id: string;
  name: string;
  city: string;
  avatar?: string;
  rating?: number;
  reviewsCount?: number;
  services: string[];
  priceFrom?: number;
  animals: string[];
}

export function SitterCard({ 
  id, 
  name, 
  city, 
  avatar, 
  rating = 5, 
  reviewsCount = 0, 
  services,
  priceFrom,
  animals 
}: SitterCardProps) {
  return (
    <Link href={`/petsitter/${id}`}>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-6xl">
          {avatar ? (
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            '👤'
          )}
          <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {city}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= rating
                      ? 'fill-primary text-primary'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({reviewsCount} avis)
            </span>
          </div>

          {/* Services */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {services.slice(0, 3).map((service) => (
                <span
                  key={service}
                  className="text-xs bg-primary-light text-primary-hover px-3 py-1 rounded-full font-semibold"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Animaux acceptés */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              🐾 {animals.join(', ')}
            </p>
          </div>

          {/* Prix */}
          {priceFrom && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                À partir de
              </p>
              <p className="text-2xl font-bold text-primary">
                {priceFrom}€<span className="text-sm text-gray-600">/jour</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
