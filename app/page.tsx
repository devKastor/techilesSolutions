import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Cloud, 
  Globe, 
  Wrench, 
  Users, 
  MapPin,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  const services = [
    {
      icon: Wrench,
      title: 'Interventions sur site',
      description: 'Support technique et maintenance informatique directement chez vous aux Îles-de-la-Madeleine.',
      features: ['Diagnostic complet', 'Réparation matériel', 'Installation logiciels', 'Formation utilisateur']
    },
    {
      icon: Cloud,
      title: 'Sauvegarde cloud sécurisée',
      description: 'Protection de vos données importantes avec stockage cloud professionnel.',
      features: ['Sauvegarde automatique', 'Accès 24/7', 'Chiffrement avancé', 'Restauration rapide']
    },
    {
      icon: Globe,
      title: 'Création de sites web',
      description: 'Sites web professionnels adaptés à vos besoins et votre budget.',
      features: ['Design responsive', 'E-commerce', 'Référencement SEO', 'Maintenance incluse']
    },
    {
      icon: Shield,
      title: 'Support technique',
      description: 'Assistance technique à distance pour résoudre vos problèmes rapidement.',
      features: ['Support 7j/7', 'Intervention rapide', 'Suivi personnalisé', 'Tarifs transparents']
    }
  ];

  const plans = [
    {
      name: 'Base',
      price: '25',
      description: 'Parfait pour débuter',
      features: [
        '1 intervention/mois',
        '10 Go de sauvegarde',
        'Support par ticket',
        'Accès portail client'
      ]
    },
    {
      name: 'Standard',
      price: '45',
      description: 'Le plus populaire',
      features: [
        '2 interventions/mois',
        '50 Go de sauvegarde',
        'Support prioritaire',
        '10% rabais site web'
      ],
      popular: true
    },
    {
      name: 'Plus',
      price: '75',
      description: 'Pour les professionnels',
      features: [
        '4 interventions/mois',
        '100 Go de sauvegarde',
        'Maintenance proactive',
        'Domaine web offert'
      ]
    },
    {
      name: 'Prestige',
      price: '120',
      description: 'Service complet',
      features: [
        'Interventions illimitées',
        '250 Go de sauvegarde',
        'Support prioritaire 24/7',
        'Site web inclus'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">TechÎle Solutions</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Connexion</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Créer un compte</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <MapPin className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-blue-600 font-medium">Îles-de-la-Madeleine, Québec</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Solutions informatiques
              <span className="text-blue-600 block">sur mesure</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Support technique professionnel, sauvegarde cloud sécurisée et création de sites web 
              pour les entreprises et particuliers des Îles-de-la-Madeleine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#services">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Découvrir nos services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nos services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une gamme complète de solutions informatiques adaptées à vos besoins
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <service.icon className="h-8 w-8 text-blue-600 mr-3" />
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Forfaits mensuels
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choisissez le forfait qui correspond à vos besoins
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative h-full ${plan.popular ? 'ring-2 ring-blue-600' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Populaire
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}$</span>
                    <span className="text-gray-600">/mois</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link href="/auth/register">
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        Choisir ce forfait
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Contactez-nous dès aujourd'hui pour discuter de vos besoins informatiques
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Créer un compte
                </Button>
              </Link>
              <a href="mailto:dev@kastor.ca">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                  Nous contacter
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 mr-2" />
                <span className="text-lg font-bold">TechÎle Solutions</span>
              </div>
              <p className="text-gray-400">
                Solutions informatiques professionnelles pour les Îles-de-la-Madeleine
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Support technique</li>
                <li>Sauvegarde cloud</li>
                <li>Création de sites web</li>
                <li>Maintenance informatique</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Îles-de-la-Madeleine, QC</li>
                <li>dev@kastor.ca</li>
                <li>Service client 7j/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TechÎle Solutions. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}