import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Professional,
  Service,
  Client,
  Appointment,
  Transaction,
  Campaign,
  Notification,
  professionals as initialProfessionals,
  services as initialServices,
  clients as initialClients,
  appointments as initialAppointments,
  transactions as initialTransactions,
  campaigns as initialCampaigns,
  notifications as initialNotifications,
  salonSettings as initialSalonSettings,
} from '@/data/mockData';

interface SalonSettings {
  name: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  workingHours: {
    [key: string]: { open: boolean; start: string; end: string };
  };
  cancellationPolicy: string;
  bookingRules: {
    minAdvanceHours: number;
    maxAdvanceDays: number;
    allowOnlinePayment: boolean;
    requireDeposit: boolean;
    depositPercentage: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professional' | 'client';
  avatar?: string;
}

interface AppContextType {
  // Auth state (mock)
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'admin' | 'professional') => void;
  logout: () => void;
  
  // Data
  professionals: Professional[];
  services: Service[];
  clients: Client[];
  appointments: Appointment[];
  transactions: Transaction[];
  campaigns: Campaign[];
  notifications: Notification[];
  salonSettings: SalonSettings;
  
  // Actions
  addProfessional: (professional: Omit<Professional, 'id'>) => void;
  updateProfessional: (id: string, data: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;
  
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;
  
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  
  addCampaign: (campaign: Omit<Campaign, 'id'>) => void;
  updateCampaign: (id: string, data: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  updateSalonSettings: (settings: Partial<SalonSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>(initialProfessionals);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [salonSettings, setSalonSettings] = useState<SalonSettings>(initialSalonSettings);

  const login = (email: string, password: string, role: 'admin' | 'professional') => {
    // Mock login
    if (role === 'admin') {
      setUser({
        id: 'admin-1',
        name: 'Administrador',
        email,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
      });
    } else {
      const prof = professionals[0];
      setUser({
        id: prof.id,
        name: prof.name,
        email,
        role: 'professional',
        avatar: prof.avatar,
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Professional CRUD
  const addProfessional = (professional: Omit<Professional, 'id'>) => {
    const newProfessional = { ...professional, id: `prof-${Date.now()}` };
    setProfessionals([...professionals, newProfessional]);
  };

  const updateProfessional = (id: string, data: Partial<Professional>) => {
    setProfessionals(professionals.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProfessional = (id: string) => {
    setProfessionals(professionals.filter(p => p.id !== id));
  };

  // Service CRUD
  const addService = (service: Omit<Service, 'id'>) => {
    const newService = { ...service, id: `serv-${Date.now()}` };
    setServices([...services, newService]);
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices(services.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  // Client CRUD
  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: `client-${Date.now()}` };
    setClients([...clients, newClient]);
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  // Appointment CRUD
  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    const newAppointment = { ...appointment, id: `apt-${Date.now()}` };
    setAppointments([...appointments, newAppointment]);
    
    // Add notification
    setNotifications([
      {
        id: `notif-${Date.now()}`,
        title: 'Novo agendamento',
        message: `${appointment.clientName} agendou ${appointment.serviceName}`,
        type: 'success',
        category: 'appointment',
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...notifications,
    ]);
  };

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, ...data } : a));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  // Campaign CRUD
  const addCampaign = (campaign: Omit<Campaign, 'id'>) => {
    const newCampaign = { ...campaign, id: `camp-${Date.now()}` };
    setCampaigns([...campaigns, newCampaign]);
  };

  const updateCampaign = (id: string, data: Partial<Campaign>) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Settings
  const updateSalonSettings = (settings: Partial<SalonSettings>) => {
    setSalonSettings({ ...salonSettings, ...settings });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        professionals,
        services,
        clients,
        appointments,
        transactions,
        campaigns,
        notifications,
        salonSettings,
        addProfessional,
        updateProfessional,
        deleteProfessional,
        addService,
        updateService,
        deleteService,
        addClient,
        updateClient,
        deleteClient,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addCampaign,
        updateCampaign,
        deleteCampaign,
        markNotificationRead,
        markAllNotificationsRead,
        updateSalonSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
