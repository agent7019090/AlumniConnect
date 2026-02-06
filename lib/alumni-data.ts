/**
 * Alumni Database Module
 * 
 * This module contains the mock alumni data for the AlumniInReach platform.
 * In a production environment, this would be replaced with database queries.
 * 
 * Data Structure:
 * - 10 alumni profiles with diverse backgrounds
 * - Companies: Google, Microsoft, Amazon, Meta, Flipkart, Infosys, TCS
 * - Roles: Software Engineer, Data Scientist, Product Manager, etc.
 * - Contact methods: Email, LinkedIn, Phone (with availability flags)
 * 
 * Each alumni profile includes:
 * - Personal identification (id, name)
 * - Professional details (company, role, experience)
 * - Technical skills for matching
 * - Contact information with privacy controls
 * - Bio for personal connection
 */

/**
 * Alumni Interface
 * Defines the structure for alumni profile data
 * 
 * @property id - Unique identifier for database operations
 * @property name - Full name for display
 * @property company - Current employer
 * @property role - Current job title
 * @property yearsOfExperience - Total years in industry
 * @property skills - Technical competencies for matching
 * @property email - Primary contact email
 * @property linkedIn - Professional networking profile URL
 * @property phone - Optional phone number
 * @property availableForCalls - Whether alumni accepts phone calls
 * @property preferredContact - Recommended contact method
 * @property bio - Personal statement about mentorship approach
 */
export interface Alumni {
  id: number;
  name: string;
  company: string;
  role: string;
  yearsOfExperience: number;
  skills: string[];
  email: string;
  linkedIn: string;
  phone?: string;
  availableForCalls: boolean;
  preferredContact: "email" | "linkedin" | "phone";
  bio: string;
}

/**
 * Alumni Database
 * 
 * Mock data representing alumni who have volunteered for mentorship.
 * Profiles are designed to cover common placement scenarios:
 * - FAANG companies (Google, Amazon, Meta, Microsoft)
 * - Indian tech giants (Flipkart, Infosys, TCS)
 * - Various roles (Engineering, Data Science, Product)
 * - Different experience levels (3-7 years)
 */
export const alumniData: Alumni[] = [
  {
    // Alumni 1: Senior Software Engineer at Google
    // Strong in JavaScript ecosystem and system design
    id: 1,
    name: "Priya Sharma",
    company: "Google",
    role: "Software Engineer",
    yearsOfExperience: 5,
    skills: ["JavaScript", "React", "Node.js", "Python", "System Design"],
    email: "priya.sharma@alumni.edu",
    linkedIn: "linkedin.com/in/priyasharma",
    phone: "+91 98765 43210",
    availableForCalls: true,
    preferredContact: "linkedin",
    bio: "Passionate about helping students crack tech interviews and building scalable applications.",
  },
  {
    // Alumni 2: Data Scientist at Microsoft
    // Expertise in ML and data analysis
    id: 2,
    name: "Rahul Verma",
    company: "Microsoft",
    role: "Data Scientist",
    yearsOfExperience: 4,
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow", "Data Analysis"],
    email: "rahul.verma@alumni.edu",
    linkedIn: "linkedin.com/in/rahulverma",
    availableForCalls: false,
    preferredContact: "email",
    bio: "Love mentoring students in data science and helping them transition into ML roles.",
  },
  {
    // Alumni 3: Product Manager at Amazon
    // Focus on product strategy and analytics
    id: 3,
    name: "Anjali Patel",
    company: "Amazon",
    role: "Product Manager",
    yearsOfExperience: 6,
    skills: ["Product Strategy", "SQL", "Data Analysis", "Agile", "User Research"],
    email: "anjali.patel@alumni.edu",
    linkedIn: "linkedin.com/in/anjalipatel",
    phone: "+91 87654 32109",
    availableForCalls: true,
    preferredContact: "linkedin",
    bio: "Happy to guide students on PM career paths and interview preparation.",
  },
  {
    // Alumni 4: Frontend Engineer at Google
    // Specialist in modern frontend technologies
    id: 4,
    name: "Vikram Singh",
    company: "Google",
    role: "Frontend Engineer",
    yearsOfExperience: 3,
    skills: ["JavaScript", "React", "TypeScript", "CSS", "Next.js"],
    email: "vikram.singh@alumni.edu",
    linkedIn: "linkedin.com/in/vikramsingh",
    availableForCalls: false,
    preferredContact: "linkedin",
    bio: "Focused on frontend excellence and helping students build amazing UIs.",
  },
  {
    // Alumni 5: Software Engineer at Meta
    // Backend and distributed systems expertise
    id: 5,
    name: "Sneha Reddy",
    company: "Meta",
    role: "Software Engineer",
    yearsOfExperience: 4,
    skills: ["Java", "Python", "System Design", "Distributed Systems", "React"],
    email: "sneha.reddy@alumni.edu",
    linkedIn: "linkedin.com/in/snehareddy",
    phone: "+91 76543 21098",
    availableForCalls: true,
    preferredContact: "email",
    bio: "Eager to help students prepare for FAANG interviews and system design rounds.",
  },
  {
    // Alumni 6: Backend Developer at Flipkart
    // Java ecosystem and microservices
    id: 6,
    name: "Arjun Mehta",
    company: "Flipkart",
    role: "Backend Developer",
    yearsOfExperience: 5,
    skills: ["Java", "Spring Boot", "Microservices", "SQL", "Redis"],
    email: "arjun.mehta@alumni.edu",
    linkedIn: "linkedin.com/in/arjunmehta",
    availableForCalls: false,
    preferredContact: "linkedin",
    bio: "Specializing in backend development and helping students with DSA preparation.",
  },
  {
    // Alumni 7: Software Engineer at Microsoft
    // Cloud and system design focus
    id: 7,
    name: "Kavya Nair",
    company: "Microsoft",
    role: "Software Engineer",
    yearsOfExperience: 3,
    skills: ["C++", "Python", "Azure", "System Design", "DSA"],
    email: "kavya.nair@alumni.edu",
    linkedIn: "linkedin.com/in/kavyanair",
    phone: "+91 65432 10987",
    availableForCalls: true,
    preferredContact: "phone",
    bio: "Happy to guide students on Microsoft interview prep and cloud technologies.",
  },
  {
    // Alumni 8: SDE II at Amazon
    // AWS and interview coaching expertise
    id: 8,
    name: "Rohan Gupta",
    company: "Amazon",
    role: "SDE II",
    yearsOfExperience: 4,
    skills: ["Java", "AWS", "System Design", "DSA", "Python"],
    email: "rohan.gupta@alumni.edu",
    linkedIn: "linkedin.com/in/rohangupta",
    availableForCalls: false,
    preferredContact: "email",
    bio: "Love helping students crack Amazon leadership principles and technical rounds.",
  },
  {
    // Alumni 9: Technical Lead at Infosys
    // IT services and leadership experience
    id: 9,
    name: "Divya Krishnan",
    company: "Infosys",
    role: "Technical Lead",
    yearsOfExperience: 7,
    skills: ["Java", "Spring Boot", "SQL", "Project Management", "Agile"],
    email: "divya.krishnan@alumni.edu",
    linkedIn: "linkedin.com/in/divyakrishnan",
    phone: "+91 54321 09876",
    availableForCalls: true,
    preferredContact: "linkedin",
    bio: "Mentoring students on IT services careers and technical leadership.",
  },
  {
    // Alumni 10: Data Analyst at TCS
    // Analytics and BI tools expertise
    id: 10,
    name: "Amit Joshi",
    company: "TCS",
    role: "Data Analyst",
    yearsOfExperience: 3,
    skills: ["Python", "SQL", "Excel", "Power BI", "Data Analysis"],
    email: "amit.joshi@alumni.edu",
    linkedIn: "linkedin.com/in/amitjoshi",
    availableForCalls: false,
    preferredContact: "email",
    bio: "Helping students transition into data analytics roles and prepare for interviews.",
  },
];

/**
 * Target Roles List
 * Predefined job roles for the dropdown selector
 * Covers common placement positions in tech industry
 */
export const targetRoles = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Data Analyst",
  "Product Manager",
  "DevOps Engineer",
  "Machine Learning Engineer",
  "Technical Lead",
];

/**
 * Popular Companies List
 * Reference list for autocomplete/suggestions
 * Includes FAANG and major Indian tech companies
 */
export const popularCompanies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Flipkart",
  "Infosys",
  "TCS",
  "Wipro",
  "Accenture",
];
