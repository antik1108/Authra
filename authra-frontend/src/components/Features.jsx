import { Bell, QrCode, MapPin, Shield, Clock, BarChart3 } from 'lucide-react';

function Features() {
  const features = [
    {
      icon: MapPin,
      title: 'Real-Time Tracking',
      description: 'Monitor your parcels every step of the way with live location updates and status changes.',
      color: 'deepred'
    },
    {
      icon: Bell,
      title: 'Instant Notifications',
      description: 'Receive immediate alerts via email and SMS when your parcel arrives or status changes.',
      color: 'orange'
    },
    {
      icon: QrCode,
      title: 'QR Verification',
      description: 'Secure pickup process with unique QR codes ensuring only authorized recipients collect parcels.',
      color: 'deepred'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Enterprise-grade security with encrypted data and multi-factor authentication options.',
      color: 'orange'
    },
    {
      icon: Clock,
      title: 'Delivery History',
      description: 'Access complete records of all deliveries with searchable history and detailed timestamps.',
      color: 'deepred'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Gain insights with comprehensive analytics on delivery patterns, volumes, and efficiency.',
      color: 'orange'
    }
  ];

  const colorMap = {
    deepred: { 
      bg: 'bg-[#C62828]/10', 
      icon: 'text-[#C62828]', 
      hover: 'group-hover:bg-[#C62828]/20' 
    },
    orange: { 
      bg: 'bg-[#E95C28]/10', 
      icon: 'text-[#E95C28]', 
      hover: 'group-hover:bg-[#E95C28]/20' 
    }
  };

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Parcel Management
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to make parcel tracking effortless and secure for everyone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color];

            return (
              <div
                key={feature.title}
                className="group bg-white rounded-xl p-8 hover:shadow-xl transition-all border border-gray-100"
              >
                <div className={`${colors.bg} ${colors.hover} w-14 h-14 rounded-lg flex items-center justify-center mb-6 transition-colors`}>
                  <Icon className={`h-7 w-7 ${colors.icon}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
