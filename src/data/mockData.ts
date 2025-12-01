// Mock Data for Beauty Salon SaaS

export interface Professional {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  commission: number;
  availability: { [key: string]: { start: string; end: string } };
  services: string[];
  rating: number;
  reviewCount: number;
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description: string;
  category: string;
  professionals: string[];
  image?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  notes?: string;
  totalSpent: number;
  visitCount: number;
  lastVisit?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  price: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  appointmentId?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  status: 'draft' | 'scheduled' | 'sent' | 'active';
  targetAudience: string;
  sentCount?: number;
  openRate?: number;
  scheduledDate?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'appointment' | 'payment' | 'system' | 'marketing';
  read: boolean;
  createdAt: string;
}

// Mock Professionals
export const professionals: Professional[] = [
  {
    id: 'prof-1',
    name: 'Maria Silva',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    specialty: 'Cabeleireira',
    commission: 40,
    availability: {
      monday: { start: '09:00', end: '18:00' },
      tuesday: { start: '09:00', end: '18:00' },
      wednesday: { start: '09:00', end: '18:00' },
      thursday: { start: '09:00', end: '18:00' },
      friday: { start: '09:00', end: '18:00' },
      saturday: { start: '09:00', end: '14:00' },
    },
    services: ['serv-1', 'serv-2', 'serv-3'],
    rating: 4.9,
    reviewCount: 127,
  },
  {
    id: 'prof-2',
    name: 'Ana Oliveira',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    specialty: 'Manicure e Pedicure',
    commission: 35,
    availability: {
      monday: { start: '10:00', end: '19:00' },
      tuesday: { start: '10:00', end: '19:00' },
      wednesday: { start: '10:00', end: '19:00' },
      thursday: { start: '10:00', end: '19:00' },
      friday: { start: '10:00', end: '19:00' },
    },
    services: ['serv-4', 'serv-5'],
    rating: 4.8,
    reviewCount: 89,
  },
  {
    id: 'prof-3',
    name: 'Carla Santos',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    specialty: 'Esteticista',
    commission: 45,
    availability: {
      tuesday: { start: '08:00', end: '17:00' },
      wednesday: { start: '08:00', end: '17:00' },
      thursday: { start: '08:00', end: '17:00' },
      friday: { start: '08:00', end: '17:00' },
      saturday: { start: '08:00', end: '13:00' },
    },
    services: ['serv-6', 'serv-7', 'serv-8'],
    rating: 4.95,
    reviewCount: 203,
  },
  {
    id: 'prof-4',
    name: 'Julia Costa',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop',
    specialty: 'Maquiadora',
    commission: 50,
    availability: {
      monday: { start: '11:00', end: '20:00' },
      wednesday: { start: '11:00', end: '20:00' },
      friday: { start: '11:00', end: '20:00' },
      saturday: { start: '09:00', end: '18:00' },
    },
    services: ['serv-9', 'serv-10'],
    rating: 4.85,
    reviewCount: 156,
  },
];

// Mock Services
export const services: Service[] = [
  {
    id: 'serv-1',
    name: 'Corte Feminino',
    duration: 45,
    price: 80,
    description: 'Corte personalizado com lavagem e finalização',
    category: 'Cabelo',
    professionals: ['prof-1'],
  },
  {
    id: 'serv-2',
    name: 'Coloração',
    duration: 120,
    price: 180,
    description: 'Coloração profissional com produtos premium',
    category: 'Cabelo',
    professionals: ['prof-1'],
  },
  {
    id: 'serv-3',
    name: 'Escova Progressiva',
    duration: 180,
    price: 350,
    description: 'Alisamento com durabilidade de até 4 meses',
    category: 'Cabelo',
    professionals: ['prof-1'],
  },
  {
    id: 'serv-4',
    name: 'Manicure',
    duration: 45,
    price: 45,
    description: 'Manicure completa com esmaltação',
    category: 'Unhas',
    professionals: ['prof-2'],
  },
  {
    id: 'serv-5',
    name: 'Pedicure',
    duration: 60,
    price: 55,
    description: 'Pedicure completa com hidratação',
    category: 'Unhas',
    professionals: ['prof-2'],
  },
  {
    id: 'serv-6',
    name: 'Limpeza de Pele',
    duration: 90,
    price: 150,
    description: 'Limpeza profunda com extração e máscara',
    category: 'Estética',
    professionals: ['prof-3'],
  },
  {
    id: 'serv-7',
    name: 'Massagem Relaxante',
    duration: 60,
    price: 120,
    description: 'Massagem corporal para relaxamento',
    category: 'Estética',
    professionals: ['prof-3'],
  },
  {
    id: 'serv-8',
    name: 'Design de Sobrancelhas',
    duration: 30,
    price: 50,
    description: 'Design personalizado com henna opcional',
    category: 'Estética',
    professionals: ['prof-3'],
  },
  {
    id: 'serv-9',
    name: 'Maquiagem Social',
    duration: 60,
    price: 150,
    description: 'Maquiagem para eventos e ocasiões especiais',
    category: 'Maquiagem',
    professionals: ['prof-4'],
  },
  {
    id: 'serv-10',
    name: 'Maquiagem Noiva',
    duration: 90,
    price: 350,
    description: 'Maquiagem especial para noivas com teste incluso',
    category: 'Maquiagem',
    professionals: ['prof-4'],
  },
];

// Mock Clients
export const clients: Client[] = [
  {
    id: 'client-1',
    name: 'Fernanda Lima',
    email: 'fernanda@email.com',
    phone: '(11) 99999-1234',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    notes: 'Preferência por horários pela manhã',
    totalSpent: 1250,
    visitCount: 8,
    lastVisit: '2024-01-15',
    createdAt: '2023-06-10',
  },
  {
    id: 'client-2',
    name: 'Patricia Souza',
    email: 'patricia@email.com',
    phone: '(11) 98888-5678',
    totalSpent: 890,
    visitCount: 5,
    lastVisit: '2024-01-18',
    createdAt: '2023-08-22',
  },
  {
    id: 'client-3',
    name: 'Camila Rodrigues',
    email: 'camila@email.com',
    phone: '(11) 97777-9012',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop',
    notes: 'Alergia a produtos com parabenos',
    totalSpent: 2100,
    visitCount: 12,
    lastVisit: '2024-01-20',
    createdAt: '2023-03-15',
  },
  {
    id: 'client-4',
    name: 'Beatriz Almeida',
    email: 'beatriz@email.com',
    phone: '(11) 96666-3456',
    totalSpent: 450,
    visitCount: 3,
    lastVisit: '2024-01-10',
    createdAt: '2023-11-05',
  },
  {
    id: 'client-5',
    name: 'Larissa Ferreira',
    email: 'larissa@email.com',
    phone: '(11) 95555-7890',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop',
    totalSpent: 3200,
    visitCount: 18,
    lastVisit: '2024-01-22',
    createdAt: '2022-12-01',
  },
];

// Generate appointments for the current week
const generateAppointments = (): Appointment[] => {
  const today = new Date();
  const appointments: Appointment[] = [];
  const statuses: Appointment['status'][] = ['confirmed', 'pending', 'completed', 'cancelled'];
  
  for (let i = -3; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const numAppointments = Math.floor(Math.random() * 5) + 3;
    
    for (let j = 0; j < numAppointments; j++) {
      const professional = professionals[Math.floor(Math.random() * professionals.length)];
      const client = clients[Math.floor(Math.random() * clients.length)];
      const serviceIds = professional.services;
      const serviceId = serviceIds[Math.floor(Math.random() * serviceIds.length)];
      const service = services.find(s => s.id === serviceId)!;
      
      const hour = 9 + Math.floor(Math.random() * 9);
      const minute = Math.random() > 0.5 ? '00' : '30';
      const startTime = `${hour.toString().padStart(2, '0')}:${minute}`;
      
      const endHour = hour + Math.floor(service.duration / 60);
      const endMinute = (parseInt(minute) + (service.duration % 60)) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      
      const status = i < 0 ? (Math.random() > 0.1 ? 'completed' : 'cancelled') : statuses[Math.floor(Math.random() * 3)];
      
      appointments.push({
        id: `apt-${dateStr}-${j}`,
        clientId: client.id,
        clientName: client.name,
        professionalId: professional.id,
        professionalName: professional.name,
        serviceId: service.id,
        serviceName: service.name,
        date: dateStr,
        startTime,
        endTime,
        status,
        price: service.price,
      });
    }
  }
  
  return appointments.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
};

export const appointments: Appointment[] = generateAppointments();

// Mock Transactions
export const transactions: Transaction[] = [
  {
    id: 'trans-1',
    date: '2024-01-22',
    type: 'income',
    category: 'Serviços',
    description: 'Corte Feminino - Fernanda Lima',
    amount: 80,
    appointmentId: 'apt-1',
  },
  {
    id: 'trans-2',
    date: '2024-01-22',
    type: 'income',
    category: 'Serviços',
    description: 'Manicure + Pedicure - Patricia Souza',
    amount: 100,
  },
  {
    id: 'trans-3',
    date: '2024-01-21',
    type: 'expense',
    category: 'Produtos',
    description: 'Reposição de esmaltes',
    amount: -250,
  },
  {
    id: 'trans-4',
    date: '2024-01-21',
    type: 'income',
    category: 'Serviços',
    description: 'Coloração - Camila Rodrigues',
    amount: 180,
  },
  {
    id: 'trans-5',
    date: '2024-01-20',
    type: 'income',
    category: 'Serviços',
    description: 'Maquiagem Social - Beatriz Almeida',
    amount: 150,
  },
  {
    id: 'trans-6',
    date: '2024-01-20',
    type: 'expense',
    category: 'Aluguel',
    description: 'Aluguel mensal do espaço',
    amount: -2500,
  },
  {
    id: 'trans-7',
    date: '2024-01-19',
    type: 'income',
    category: 'Serviços',
    description: 'Escova Progressiva - Larissa Ferreira',
    amount: 350,
  },
  {
    id: 'trans-8',
    date: '2024-01-18',
    type: 'income',
    category: 'Serviços',
    description: 'Limpeza de Pele - Fernanda Lima',
    amount: 150,
  },
];

// Mock Campaigns
export const campaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Promoção de Verão',
    type: 'email',
    status: 'sent',
    targetAudience: 'Todos os clientes',
    sentCount: 156,
    openRate: 42,
  },
  {
    id: 'camp-2',
    name: 'Lembrete de Agendamento',
    type: 'whatsapp',
    status: 'active',
    targetAudience: 'Clientes com agendamento',
  },
  {
    id: 'camp-3',
    name: 'Dia das Mães',
    type: 'sms',
    status: 'scheduled',
    targetAudience: 'Clientes VIP',
    scheduledDate: '2024-05-01',
  },
  {
    id: 'camp-4',
    name: 'Novos Serviços',
    type: 'email',
    status: 'draft',
    targetAudience: 'Clientes inativos (30+ dias)',
  },
];

// Mock Notifications
export const notifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Novo agendamento',
    message: 'Fernanda Lima agendou Corte Feminino para amanhã às 10:00',
    type: 'success',
    category: 'appointment',
    read: false,
    createdAt: '2024-01-22T14:30:00',
  },
  {
    id: 'notif-2',
    title: 'Pagamento recebido',
    message: 'Pagamento de R$ 180,00 confirmado - Coloração',
    type: 'success',
    category: 'payment',
    read: false,
    createdAt: '2024-01-22T13:15:00',
  },
  {
    id: 'notif-3',
    title: 'Cancelamento',
    message: 'Patricia Souza cancelou o agendamento de amanhã',
    type: 'warning',
    category: 'appointment',
    read: true,
    createdAt: '2024-01-22T11:00:00',
  },
  {
    id: 'notif-4',
    title: 'Lembrete',
    message: 'Você tem 5 agendamentos para hoje',
    type: 'info',
    category: 'system',
    read: true,
    createdAt: '2024-01-22T08:00:00',
  },
  {
    id: 'notif-5',
    title: 'Campanha enviada',
    message: 'A campanha "Promoção de Verão" foi enviada com sucesso',
    type: 'success',
    category: 'marketing',
    read: true,
    createdAt: '2024-01-21T16:00:00',
  },
];

// Salon Settings Mock
export const salonSettings = {
  name: 'Studio Bella',
  logo: '',
  address: 'Rua das Flores, 123 - Centro',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01234-567',
  phone: '(11) 3456-7890',
  email: 'contato@studiobella.com',
  website: 'www.studiobella.com',
  workingHours: {
    monday: { open: true, start: '09:00', end: '19:00' },
    tuesday: { open: true, start: '09:00', end: '19:00' },
    wednesday: { open: true, start: '09:00', end: '19:00' },
    thursday: { open: true, start: '09:00', end: '19:00' },
    friday: { open: true, start: '09:00', end: '19:00' },
    saturday: { open: true, start: '09:00', end: '15:00' },
    sunday: { open: false, start: '', end: '' },
  },
  cancellationPolicy: 'Cancelamentos devem ser feitos com no mínimo 24 horas de antecedência. Cancelamentos tardios podem resultar em cobrança de 50% do valor do serviço.',
  bookingRules: {
    minAdvanceHours: 2,
    maxAdvanceDays: 30,
    allowOnlinePayment: true,
    requireDeposit: false,
    depositPercentage: 0,
  },
};

// Stats for Dashboard
export const dashboardStats = {
  todayAppointments: 8,
  weekRevenue: 4250,
  monthRevenue: 18500,
  newClients: 12,
  completionRate: 94,
  averageRating: 4.8,
  topServices: [
    { name: 'Corte Feminino', count: 45 },
    { name: 'Manicure', count: 38 },
    { name: 'Coloração', count: 22 },
    { name: 'Limpeza de Pele', count: 18 },
  ],
  topProfessionals: [
    { name: 'Maria Silva', appointments: 52, revenue: 6800 },
    { name: 'Ana Oliveira', appointments: 48, revenue: 4200 },
    { name: 'Carla Santos', appointments: 35, revenue: 5600 },
  ],
  revenueByMonth: [
    { month: 'Set', revenue: 15200 },
    { month: 'Out', revenue: 16800 },
    { month: 'Nov', revenue: 17500 },
    { month: 'Dez', revenue: 22000 },
    { month: 'Jan', revenue: 18500 },
  ],
};

// Pricing Plans
export const pricingPlans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 79,
    description: 'Perfeito para salões iniciantes',
    features: [
      'Até 2 profissionais',
      'Agendamento online',
      'Gestão de clientes',
      'Relatórios básicos',
      'Suporte por email',
    ],
    notIncluded: [
      'Marketing automatizado',
      'Integrações avançadas',
      'API personalizada',
    ],
  },
  {
    id: 'professional',
    name: 'Profissional',
    price: 149,
    description: 'Ideal para salões em crescimento',
    popular: true,
    features: [
      'Até 10 profissionais',
      'Agendamento online',
      'Gestão de clientes',
      'Relatórios avançados',
      'Marketing automatizado',
      'Lembretes por WhatsApp',
      'Suporte prioritário',
    ],
    notIncluded: [
      'API personalizada',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    description: 'Para redes e franquias',
    features: [
      'Profissionais ilimitados',
      'Múltiplas unidades',
      'Agendamento online',
      'Gestão completa',
      'Relatórios personalizados',
      'Marketing avançado',
      'Integrações completas',
      'API personalizada',
      'Gerente de conta dedicado',
    ],
    notIncluded: [],
  },
];

// Available time slots generator
export const generateTimeSlots = (date: Date, professionalId: string): string[] => {
  const slots: string[] = [];
  const professional = professionals.find(p => p.id === professionalId);
  if (!professional) return slots;
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof professional.availability;
  const availability = professional.availability[dayName];
  
  if (!availability) return slots;
  
  const startHour = parseInt(availability.start.split(':')[0]);
  const endHour = parseInt(availability.end.split(':')[0]);
  
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  // Remove some random slots to simulate booked times
  const bookedCount = Math.floor(Math.random() * (slots.length / 3));
  for (let i = 0; i < bookedCount; i++) {
    const randomIndex = Math.floor(Math.random() * slots.length);
    slots.splice(randomIndex, 1);
  }
  
  return slots;
};
