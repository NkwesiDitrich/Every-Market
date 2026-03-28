import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // General / Common
      "Home": "Home",
      "Profile": "Profile",
      "Orders": "Orders",
      "Inbox": "Inbox",
      "Logout": "Logout",
      "Login": "Login",
      "Signup": "Signup",
      "Search": "Search Products...",
      "Account": "Account",
      "My Disputes": "My Disputes",
      "Become a Seller": "Become a Seller",
      "Seller Dashboard": "Seller Dashboard",
      "Admin Dashboard": "Admin Dashboard",
      "Cart": "Cart",
      "Wishlist": "Wishlist",

      // Sidebar Groups
      "Business": "Business",
      "Inventory": "Inventory",
      "Growth": "Growth",
      "Customer": "Customer",
      "Store": "Store",

      // Sidebar Items
      "Overview": "Overview",
      "Insights": "Insights",
      "My Products": "My Products",
      "Promotions": "Promotions",
      "Earnings": "Earnings",
      "Reviews": "Reviews",
      "Returns": "Returns",
      "Disputes": "Disputes",
      "Settings": "Settings",
      "Help Center": "Help Center",

      // Order Statuses
      "Pending": "Pending",
      "Confirmed": "Confirmed",
      "Shipped": "Shipped",
      "Out for delivery": "Out for delivery",
      "Delivered": "Delivered",
      "Cancelled": "Cancelled",
      "Returned": "Returned",

      // Labels & Buttons
      "Order History": "Order History",
      "Track, manage, and review your previous purchases.": "Track, manage, and review your previous purchases.",
      "Order Date": "Order Date",
      "Total Amount": "Total Amount",
      "Status": "Status",
      "Receipt": "Receipt",
      "Cancel Order": "Cancel Order",
      "Order ID": "Order ID",
      "Quantity": "Quantity",
      "View": "View",
      "Buy Again": "Buy Again",
      "Return": "Return",
      "Dispute": "Dispute",
      "Message Seller": "Message Seller",
      "No orders yet": "No orders yet",
      "Start Shopping": "Start Shopping",
      "Product Information Unavailable": "Product Information Unavailable",
      "Product ID": "Product ID",
      "Order Fulfillment": "Order Fulfillment",
      "Manage your incoming orders and track fulfillment progress.": "Manage your incoming orders and track fulfillment progress.",
      "All Orders": "All Orders",
      "Fulfilling": "Fulfilling",
      "Syncing orders with server...": "Syncing orders with server...",
      "Order Details": "Order Details",
      "Items": "Items",
      "Amount": "Amount",
      "Actions": "Actions",

      // Seller Products Page
      "Product": "Product",
      "Price": "Price",
      "Inventory Management": "Inventory Management",
      "Total Products": "Total Products",
      "Add Product": "Add Product",
      "Search products...": "Search products...",
      "Export CSV": "Export CSV",
      "Loading catalog...": "Loading catalog...",
      "Delete Product": "Delete Product",
      "Edit Product": "Edit Product",
      "New Listing": "New Listing",
      "Product Name": "Product Name",
      "Short Description": "Short Description",
      "Full Description": "Full Description",
      "common": {
        "chat": "Chat",
        "buyNow": "Buy Now"
      },
      "product": {
        "addToCart": "Add to Cart",
        "outOfStock": "Out of Stock",
        "inCart": "Already in Cart"
      }
    }
  },
  fr: {
    translation: {
      // General / Common
      "Home": "Accueil",
      "Profile": "Profil",
      "Orders": "Commandes",
      "Inbox": "Boîte de réception",
      "Logout": "Déconnexion",
      "Login": "Connexion",
      "Signup": "S'inscrire",
      "Search": "Rechercher des produits...",
      "Account": "Compte",
      "My Disputes": "Mes Litiges",
      "Become a Seller": "Devenir Vendeur",
      "Seller Dashboard": "Tableau de Bord Vendeur",
      "Admin Dashboard": "Tableau de Bord Admin",
      "Cart": "Panier",
      "Wishlist": "Liste de Souhaits",

      // Sidebar Groups
      "Business": "Affaires",
      "Inventory": "Inventaire",
      "Growth": "Croissance",
      "Customer": "Client",
      "Store": "Boutique",

      // Sidebar Items
      "Overview": "Vue d'ensemble",
      "Insights": "Analyses",
      "My Products": "Mes Produits",
      "Promotions": "Promotions",
      "Earnings": "Revenus",
      "Reviews": "Avis",
      "Returns": "Retours",
      "Disputes": "Litiges",
      "Settings": "Paramètres",
      "Help Center": "Centre d'Aide",

      // Order Statuses
      "Pending": "En attente",
      "Confirmed": "Confirmée",
      "Shipped": "Expédiée",
      "Out for delivery": "En cours de livraison",
      "Delivered": "Livrée",
      "Cancelled": "Annulée",
      "Returned": "Retournée",

      // Labels & Buttons
      "Order History": "Historique des Commandes",
      "Track, manage, and review your previous purchases.": "Suivez, gérez et consultez vos achats précédents.",
      "Order Date": "Date de Commande",
      "Total Amount": "Montant Total",
      "Status": "Statut",
      "Receipt": "Reçu",
      "Cancel Order": "Annuler la Commande",
      "Order ID": "ID de Commande",
      "Quantity": "Quantité",
      "View": "Voir",
      "Buy Again": "Acheter à Nouveau",
      "Return": "Retourner",
      "Dispute": "Litige",
      "Message Seller": "Contacter le Vendeur",
      "No orders yet": "Pas encore de commandes",
      "Start Shopping": "Commencer vos Achats",
      "Product Information Unavailable": "Informations Produit Indisponibles",
      "Product ID": "ID du Produit",
      "Order Fulfillment": "Traitement des Commandes",
      "Manage your incoming orders and track fulfillment progress.": "Gérez vos commandes entrantes et suivez les progrès du traitement.",
      "All Orders": "Toutes les Commandes",
      "Fulfilling": "En Cours",
      "Syncing orders with server...": "Synchronisation des commandes...",
      "Order Details": "Détails de la Commande",
      "Items": "Articles",
      "Amount": "Montant",
      "Actions": "Actions",

      // Seller Products Page
      "Product": "Produit",
      "Price": "Prix",
      "Inventory Management": "Gestion des Stocks",
      "Total Products": "Produits au Total",
      "Add Product": "Ajouter un Produit",
      "Search products...": "Rechercher des produits...",
      "Export CSV": "Exporter CSV",
      "Loading catalog...": "Chargement du catalogue...",
      "Delete Product": "Supprimer le Produit",
      "Edit Product": "Modifier le Produit",
      "New Listing": "Nouvelle Annonce",
      "Product Name": "Nom du Produit",
      "Short Description": "Description Courte",
      "Full Description": "Description Complète",
      "common": {
        "chat": "Chat",
        "buyNow": "Acheter"
      },
      "product": {
        "addToCart": "Ajouter au panier",
        "outOfStock": "Rupture de stock",
        "inCart": "Déjà au panier"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
