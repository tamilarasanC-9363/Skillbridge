import { getEstimatedPrice } from '../services/servicePricing';

const CATEGORY_RANGES = {
  'Plumbing': '₹300 – ₹800',
  'Electrical': '₹400 – ₹1,000',
  'Carpentry': '₹500 – ₹1,500',
  'Mason / Construction': '₹600 – ₹2,000',
  'Painting': '₹500 – ₹2,500',
  'Cleaning': '₹400 – ₹1,200'
};

export default function PriceEstimate({ category, jobType, customRange, showDisclaimer = true }) {
  const estimate = getEstimatedPrice(category, jobType) || customRange || CATEGORY_RANGES[category] || '₹300 – ₹1,000';

  return (
    <div className="bg-stone-50 dark:bg-[#11171E] border border-[#EBE5DE] dark:border-white/10 rounded-2xl p-5 my-4 text-left shadow-xs">
      <div className="text-[11px] font-extrabold text-[#283845] dark:text-[#FFA649] uppercase tracking-wider">Estimated Price</div>
      <div className="text-2xl font-extrabold text-[#283845] dark:text-white mt-1.5">{estimate}</div>
      {showDisclaimer && (
        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2 italic leading-normal">
          *This is an estimate. Final pricing is agreed between you and the worker.*
        </p>
      )}
    </div>
  );
}
