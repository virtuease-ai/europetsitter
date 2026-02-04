export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            Dernière mise à jour : 26 janvier 2026
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              EuroPetSitter s'engage à protéger la vie privée de ses utilisateurs. Cette politique 
              de confidentialité explique comment nous collectons, utilisons et protégeons vos données 
              personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Données Collectées</h2>
            <p className="text-gray-700 mb-4">
              <strong>2.1 Données d'inscription</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Mot de passe (crypté)</li>
              <li>Numéro de téléphone (optionnel)</li>
            </ul>
            
            <p className="text-gray-700 mb-4">
              <strong>2.2 Données de profil petsitter</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Adresse et localisation</li>
              <li>Photos de profil</li>
              <li>Description et qualifications</li>
              <li>Services proposés</li>
              <li>Tarifs</li>
              <li>Pièce d'identité (pour vérification)</li>
            </ul>

            <p className="text-gray-700 mb-4">
              <strong>2.3 Données de navigation</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Adresse IP</li>
              <li>Type de navigateur</li>
              <li>Pages visitées</li>
              <li>Durée de visite</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Utilisation des Données</h2>
            <p className="text-gray-700 mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Créer et gérer votre compte</li>
              <li>Faciliter la mise en relation entre propriétaires et petsitters</li>
              <li>Améliorer nos services</li>
              <li>Vous envoyer des communications importantes (notifications de réservation, etc.)</li>
              <li>Assurer la sécurité de la plateforme</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Partage des Données</h2>
            <p className="text-gray-700 mb-4">
              <strong>4.1 Avec d'autres utilisateurs</strong><br />
              Les informations de votre profil public (nom, photo, description, services) sont 
              visibles par les autres utilisateurs de la plateforme.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>4.2 Avec des tiers</strong><br />
              Nous ne vendons jamais vos données. Nous pouvons partager certaines données avec :
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Nos prestataires de services (hébergement, paiement)</li>
              <li>Les autorités légales si requis par la loi</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Sécurité des Données</h2>
            <p className="text-gray-700 mb-4">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
              appropriées pour protéger vos données :
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Cryptage SSL/TLS des communications</li>
              <li>Stockage sécurisé des mots de passe (hashage bcrypt)</li>
              <li>Accès limité aux données personnelles</li>
              <li>Sauvegardes régulières</li>
              <li>Surveillance des accès</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Vos Droits (RGPD)</h2>
            <p className="text-gray-700 mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
              <li><strong>Droit de limitation</strong> : limiter le traitement dans certains cas</li>
            </ul>
            <p className="text-gray-700 mt-4">
              Pour exercer ces droits, contactez-nous à : privacy@europetsitter.be
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Cookies</h2>
            <p className="text-gray-700 mb-4">
              <strong>7.1 Cookies essentiels</strong><br />
              Nécessaires au fonctionnement de la plateforme (authentification, préférences).
            </p>
            <p className="text-gray-700 mb-4">
              <strong>7.2 Cookies analytiques</strong><br />
              Nous utilisons Google Analytics pour comprendre l'utilisation de notre site. 
              Vous pouvez les désactiver dans les paramètres de votre navigateur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Conservation des Données</h2>
            <p className="text-gray-700">
              Vos données sont conservées :
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Pendant toute la durée d'activité de votre compte</li>
              <li>3 ans après la suppression de votre compte (pour obligations légales)</li>
              <li>Les données de facturation : 10 ans (obligations comptables)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Transferts Internationaux</h2>
            <p className="text-gray-700">
              Vos données sont hébergées au sein de l'Union Européenne. Nous ne transférons 
              pas vos données hors UE, sauf consentement explicite ou pour des services cloud 
              conformes au RGPD.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Mineurs</h2>
            <p className="text-gray-700">
              Notre plateforme est réservée aux personnes de 18 ans et plus. Nous ne collectons 
              pas sciemment de données d'enfants de moins de 18 ans.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Modifications</h2>
            <p className="text-gray-700">
              Nous pouvons modifier cette politique de confidentialité. En cas de changement majeur, 
              nous vous en informerons par email.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Contact</h2>
            <p className="text-gray-700">
              <strong>Responsable du traitement des données :</strong><br />
              EuroPetSitter<br />
              Rue de l'Innovation 123, 1000 Bruxelles, Belgique<br />
              Email : privacy@europetsitter.be<br />
              <br />
              <strong>Autorité de contrôle :</strong><br />
              Vous pouvez introduire une réclamation auprès de l'Autorité de Protection des Données (APD) belge.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
