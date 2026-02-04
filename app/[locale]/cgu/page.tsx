export default function CGUPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            Dernière mise à jour : 26 janvier 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Objet</h2>
            <p className="text-gray-700 mb-4">
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les 
              conditions d'accès et d'utilisation de la plateforme EuroPetSitter par les utilisateurs.
            </p>
            <p className="text-gray-700">
              EuroPetSitter est une plateforme de mise en relation entre propriétaires d'animaux 
              et petsitters professionnels en Belgique.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Inscription et Compte Utilisateur</h2>
            <p className="text-gray-700 mb-4">
              <strong>2.1 Conditions d'inscription</strong><br />
              Pour créer un compte, vous devez :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Avoir au moins 18 ans</li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Accepter les présentes CGU</li>
            </ul>
            <p className="text-gray-700">
              <strong>2.2 Types de comptes</strong><br />
              - Compte Propriétaire : gratuit, sans limitation<br />
              - Compte Petsitter : 3 mois d'essai gratuit, puis abonnement mensuel
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Services Proposés</h2>
            <p className="text-gray-700 mb-4">
              EuroPetSitter propose une plateforme de mise en relation permettant aux propriétaires 
              d'animaux de trouver des petsitters qualifiés et aux petsitters de proposer leurs services.
            </p>
            <p className="text-gray-700">
              La plateforme ne prélève aucune commission sur les transactions entre propriétaires 
              et petsitters. Les paiements s'effectuent directement entre les parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Obligations des Utilisateurs</h2>
            <p className="text-gray-700 mb-4">
              <strong>4.1 Obligations générales</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Fournir des informations exactes</li>
              <li>Ne pas usurper l'identité d'autrui</li>
              <li>Respecter les lois en vigueur</li>
              <li>Ne pas utiliser la plateforme à des fins frauduleuses</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>4.2 Obligations des Petsitters</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Disposer des qualifications nécessaires</li>
              <li>Maintenir à jour son profil et ses disponibilités</li>
              <li>Répondre aux demandes dans un délai raisonnable</li>
              <li>Disposer d'une assurance responsabilité civile</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Tarification et Paiement</h2>
            <p className="text-gray-700 mb-4">
              <strong>5.1 Pour les propriétaires</strong><br />
              L'accès à la plateforme est entièrement gratuit. Aucun frais d'inscription ou d'abonnement.
            </p>
            <p className="text-gray-700">
              <strong>5.2 Pour les petsitters</strong><br />
              - 3 premiers mois : gratuit<br />
              - Après l'essai : abonnement mensuel (tarif communiqué lors de l'inscription)<br />
              - Aucune commission sur les services fournis
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Responsabilité</h2>
            <p className="text-gray-700 mb-4">
              EuroPetSitter agit uniquement en tant qu'intermédiaire de mise en relation. 
              La plateforme ne peut être tenue responsable :
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>De la qualité des services fournis par les petsitters</li>
              <li>Des dommages causés aux animaux ou aux biens</li>
              <li>Des litiges entre propriétaires et petsitters</li>
              <li>Des informations inexactes fournies par les utilisateurs</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Propriété Intellectuelle</h2>
            <p className="text-gray-700">
              Tous les éléments de la plateforme EuroPetSitter (logos, textes, images, design) 
              sont protégés par le droit d'auteur. Toute reproduction non autorisée est interdite.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Protection des Données</h2>
            <p className="text-gray-700">
              Le traitement des données personnelles est décrit dans notre 
              <a href="/fr/confidentialite" className="text-primary hover:underline"> Politique de Confidentialité</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Résiliation</h2>
            <p className="text-gray-700">
              Chaque utilisateur peut supprimer son compte à tout moment depuis les paramètres. 
              EuroPetSitter se réserve le droit de suspendre ou supprimer tout compte en cas 
              de non-respect des présentes CGU.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Droit Applicable</h2>
            <p className="text-gray-700">
              Les présentes CGU sont soumises au droit belge. Tout litige sera de la compétence 
              exclusive des tribunaux de Bruxelles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Contact</h2>
            <p className="text-gray-700">
              Pour toute question concernant les présentes CGU :<br />
              Email : contact@europetsitter.be<br />
              Adresse : Rue de l'Innovation 123, 1000 Bruxelles, Belgique
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
