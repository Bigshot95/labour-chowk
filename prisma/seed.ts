import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Rajesh Kumar',
        phone: '+919876543210',
        role: 'CUSTOMER',
        isVerified: true,
        address: 'Sector 15, Gurgaon',
        pincode: '122001',
        language: 'en'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Priya Sharma',
        phone: '+919876543211',
        role: 'CUSTOMER',
        isVerified: true,
        address: 'Koramangala, Bangalore',
        pincode: '560034',
        language: 'en'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Amit Singh',
        phone: '+919876543212',
        role: 'CUSTOMER',
        isVerified: true,
        address: 'Andheri West, Mumbai',
        pincode: '400058',
        language: 'hi'
      }
    })
  ])

  // Create sample workers
  const workers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Ramesh Yadav',
        phone: '+919876543220',
        role: 'WORKER',
        isVerified: true,
        address: 'Sector 12, Gurgaon',
        pincode: '122001',
        language: 'hi',
        workerProfile: {
          create: {
            age: 35,
            aadhaar: '123456789012',
            profilePic: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
            skills: JSON.stringify(['Carpenter', 'Handyman']),
            experience: '5-10 years',
            dailyRate: 800,
            hourlyRate: 100,
            projectRate: 5000,
            availability: JSON.stringify({
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: false
            }),
            portfolio: JSON.stringify([
              'https://images.pexels.com/photos/1474093/pexels-photo-1474093.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=400'
            ]),
            rating: 4.5,
            totalJobs: 45,
            isAvailable: true
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Suresh Patel',
        phone: '+919876543221',
        role: 'WORKER',
        isVerified: true,
        address: 'Whitefield, Bangalore',
        pincode: '560066',
        language: 'en',
        workerProfile: {
          create: {
            age: 42,
            aadhaar: '123456789013',
            profilePic: 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=400',
            skills: JSON.stringify(['Plumber', 'Electrician']),
            experience: 'More than 10 years',
            dailyRate: 1200,
            hourlyRate: 150,
            projectRate: 8000,
            availability: JSON.stringify({
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: false,
              sunday: false
            }),
            portfolio: JSON.stringify([
              'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=400'
            ]),
            rating: 4.8,
            totalJobs: 78,
            isAvailable: true
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Vijay Kumar',
        phone: '+919876543222',
        role: 'WORKER',
        isVerified: true,
        address: 'Bandra East, Mumbai',
        pincode: '400051',
        language: 'hi',
        workerProfile: {
          create: {
            age: 28,
            aadhaar: '123456789014',
            profilePic: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
            skills: JSON.stringify(['Painter', 'Mason']),
            experience: '3-5 years',
            dailyRate: 700,
            hourlyRate: 90,
            projectRate: 4000,
            availability: JSON.stringify({
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: true
            }),
            portfolio: JSON.stringify([
              'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/209274/pexels-photo-209274.jpeg?auto=compress&cs=tinysrgb&w=400'
            ]),
            rating: 4.2,
            totalJobs: 32,
            isAvailable: true
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Mohan Lal',
        phone: '+919876543223',
        role: 'WORKER',
        isVerified: true,
        address: 'Lajpat Nagar, Delhi',
        pincode: '110024',
        language: 'hi',
        workerProfile: {
          create: {
            age: 38,
            aadhaar: '123456789015',
            profilePic: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
            skills: JSON.stringify(['Driver', 'Cleaner']),
            experience: '5-10 years',
            dailyRate: 600,
            hourlyRate: 75,
            projectRate: 3000,
            availability: JSON.stringify({
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: false,
              sunday: false
            }),
            portfolio: JSON.stringify([]),
            rating: 4.0,
            totalJobs: 25,
            isAvailable: true
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Arjun Singh',
        phone: '+919876543224',
        role: 'WORKER',
        isVerified: true,
        address: 'Sector 18, Noida',
        pincode: '201301',
        language: 'en',
        workerProfile: {
          create: {
            age: 31,
            aadhaar: '123456789016',
            profilePic: 'https://images.pexels.com/photos/1722198/pexels-photo-1722198.jpeg?auto=compress&cs=tinysrgb&w=400',
            skills: JSON.stringify(['Electrician', 'Handyman']),
            experience: '3-5 years',
            dailyRate: 900,
            hourlyRate: 120,
            projectRate: 5500,
            availability: JSON.stringify({
              monday: true,
              tuesday: true,
              wednesday: false,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: false
            }),
            portfolio: JSON.stringify([
              'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400',
              'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=400'
            ]),
            rating: 4.6,
            totalJobs: 38,
            isAvailable: true
          }
        }
      }
    })
  ])

  console.log('Seeded database with sample data')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })