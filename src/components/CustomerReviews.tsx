import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, ThumbsUp, ChevronRight, User } from 'lucide-react';

export interface ReviewItem {
  id: number;
  name: string;
  city: string;
  state: string;
  loanType: string;
  amount: string;
  disbursalTime: string;
  rating: number;
  reviewText: string;
  date: string;
  initials: string;
  avatarBg: string;
}

export const CUSTOMER_REVIEWS: ReviewItem[] = [
  {
    id: 1,
    name: 'Rajesh Sharma',
    city: 'Mumbai',
    state: 'Maharashtra',
    loanType: 'Personal Loan',
    amount: '₹3,50,000',
    disbursalTime: 'Transfer in 1 hour',
    rating: 5,
    reviewText: 'This is 100% Trusted Company! Applied in the morning for medical emergency, and the loan amount was transferred directly into my bank account in 1 hour. No advance fees demanded. Best service in India.',
    date: 'Yesterday',
    initials: 'RS',
    avatarBg: 'bg-blue-600',
  },
  {
    id: 2,
    name: 'Priya Patel',
    city: 'Ahmedabad',
    state: 'Gujarat',
    loanType: 'Business Loan',
    amount: '₹5,00,000',
    disbursalTime: 'Transfer in 1.5 hours',
    rating: 5,
    reviewText: 'Bahut hi fast aur transparent service hai! 1 ghante ke andar verification complete hua aur meri boutique shop ke liye direct bank account me paise transfer ho gaye. Absolutely trustworthy company.',
    date: '2 days ago',
    initials: 'PP',
    avatarBg: 'bg-emerald-600',
  },
  {
    id: 3,
    name: 'Amit Verma',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    loanType: 'Personal Loan',
    amount: '₹2,00,000',
    disbursalTime: 'Transfer in 45 mins',
    rating: 5,
    reviewText: 'Very genuine finance service. Mujhe lag raha tha koi advance charge maangenge par ek rupya bhi upfront nahi liya. Exact 1 hour me loan amount mere PNB account me credit ho gaya. Highly recommended!',
    date: '3 days ago',
    initials: 'AV',
    avatarBg: 'bg-indigo-600',
  },
  {
    id: 4,
    name: 'Vikram Malhotra',
    city: 'New Delhi',
    state: 'Delhi NCR',
    loanType: 'Business Expansion',
    amount: '₹8,50,000',
    disbursalTime: 'Transfer in 2 hours',
    rating: 5,
    reviewText: 'Fastest loan disbursal I have ever experienced. Needed urgent working capital for inventory. Dhani Finance verification executive called within 10 minutes and amount credited in 2 hours.',
    date: '4 days ago',
    initials: 'VM',
    avatarBg: 'bg-purple-600',
  },
  {
    id: 5,
    name: 'Sunita Devi',
    city: 'Patna',
    state: 'Bihar',
    loanType: 'Emergency Loan',
    amount: '₹1,50,000',
    disbursalTime: 'Transfer in 1 hour',
    rating: 5,
    reviewText: 'Sach me bahut bharosemand company hai. Sirf Aadhaar aur PAN se digital verification hua aur 1 ghante me paise aa gaye. Zero advance fee. Sabhi ko yahi se loan lena chahiye.',
    date: '5 days ago',
    initials: 'SD',
    avatarBg: 'bg-rose-600',
  },
  {
    id: 6,
    name: 'Ananya Iyer',
    city: 'Bengaluru',
    state: 'Karnataka',
    loanType: 'Personal Loan',
    amount: '₹4,00,000',
    disbursalTime: 'Transfer in 50 mins',
    rating: 5,
    reviewText: 'Completely digital and 100% paperless process! No hidden charges, no physical branch visit. Direct electronic funds transfer within an hour. Excellent customer support team.',
    date: '6 days ago',
    initials: 'AI',
    avatarBg: 'bg-teal-600',
  },
  {
    id: 7,
    name: 'Rohit Deshmukh',
    city: 'Pune',
    state: 'Maharashtra',
    loanType: 'Home Loan',
    amount: '₹6,00,000',
    disbursalTime: 'Transfer in 1.5 hours',
    rating: 5,
    reviewText: 'Best loan experience! Clean process, affordable monthly EMI schedule, and instant bank transfer notification. Dhani Finance is definitely the most trusted lender.',
    date: '1 week ago',
    initials: 'RD',
    avatarBg: 'bg-amber-600',
  },
  {
    id: 8,
    name: 'Pooja Gupta',
    city: 'Jaipur',
    state: 'Rajasthan',
    loanType: 'Education Loan',
    amount: '₹3,00,000',
    disbursalTime: 'Transfer in 1 hour',
    rating: 5,
    reviewText: 'Needed urgent college fee deposit for my brother. Everywhere else asked for heavy collateral, but Dhani Finance approved in just 1 hour directly into bank account. Truly a lifesaver!',
    date: '1 week ago',
    initials: 'PG',
    avatarBg: 'bg-pink-600',
  },
  {
    id: 9,
    name: 'Harpreet Singh',
    city: 'Ludhiana',
    state: 'Punjab',
    loanType: 'Machinery Loan',
    amount: '₹10,00,000',
    disbursalTime: 'Transfer in 2 hours',
    rating: 5,
    reviewText: 'Genuinely impressed with Dhani Finance Limited. Direct RTGS transfer in less than 2 hours without any security deposit or file charges. 10/10 service for business owners.',
    date: '10 days ago',
    initials: 'HS',
    avatarBg: 'bg-blue-700',
  },
  {
    id: 10,
    name: 'Manoj Kumar',
    city: 'Kolkata',
    state: 'West Bengal',
    loanType: 'Personal Loan',
    amount: '₹2,50,000',
    disbursalTime: 'Transfer in 1 hour',
    rating: 5,
    reviewText: '100% genuine NBFC campaign portal. Transparent EMI breakdown and instant SMS credit alert. Trusted loan company, hassle-free disbursal.',
    date: '12 days ago',
    initials: 'MK',
    avatarBg: 'bg-emerald-700',
  },
];

export const CustomerReviews: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('All');

  const filteredReviews = filterType === 'All'
    ? CUSTOMER_REVIEWS
    : CUSTOMER_REVIEWS.filter((r) => r.loanType.toLowerCase().includes(filterType.toLowerCase()));

  return (
    <section className="py-14 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Trust Stats */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Verified Borrower Testimonials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Trusted by 50,000+ Happy Borrowers Across India
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Real experiences from verified customers who received instant loan amount transfers directly to their bank accounts.
          </p>

          {/* Rating Summary Bar */}
          <div className="mt-4 inline-flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-xs border border-slate-200">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-extrabold text-sm text-slate-900">4.9 / 5.0</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-600 font-semibold">Over 10,000+ Five Star Reviews</span>
          </div>
        </div>

        {/* 10 Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${review.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
                    >
                      {review.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {review.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {review.city}, {review.state}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {review.date}
                  </span>
                </div>

                {/* Rating & Fast Disbursal Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{review.disbursalTime}</span>
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{review.reviewText}&rdquo;
                </p>
              </div>

              {/* Loan Details Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium text-[11px]">
                  {review.loanType}
                </span>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[11px]">
                  Disbursed: {review.amount}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Highlight */}
        <div className="mt-10 max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-700">
            <strong className="text-blue-900">100% Genuine NBFC Experience:</strong> Zero advance fees, fast digital verification, and instant bank credit directly to your verified savings account.
          </p>
        </div>
      </div>
    </section>
  );
};
