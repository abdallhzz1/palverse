import { RatingStarsDisplay } from "./RatingStarsDisplay";

interface RatingSummaryProps {
  summary: {
    average_rating: number;
    total_count: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  } | null;
}

export function RatingSummary({ summary }: RatingSummaryProps) {
  if (!summary || summary.total_count === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center h-full min-h-[200px]">
        <div className="text-gray-400 mb-2">
          <RatingStarsDisplay rating={0} size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-700">لا توجد تقييمات بعد</h3>
        <p className="text-sm text-gray-500">كن أول من يقيّم هذا المتجر!</p>
      </div>
    );
  }

  // Ensure types and calculate percentages safely
  const dist = summary.distribution;
  const safeCount = Math.max(1, summary.total_count);

  const getPercentage = (stars: number) => {
    // using Record index safely since keys are 1,2,3,4,5
    const count = dist[stars as keyof typeof dist] || 0;
    return Math.round((count / safeCount) * 100);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start h-full">
      {/* Average Score */}
      <div className="flex flex-col items-center justify-center min-w-[140px] pt-2">
        <span className="text-5xl font-bold text-[#0F3D2E] font-heading">{summary.average_rating.toFixed(1)}</span>
        <div className="my-2">
          <RatingStarsDisplay rating={summary.average_rating} size={20} />
        </div>
        <span className="text-sm text-gray-500">
          بناءً على {summary.total_count} {summary.total_count === 1 ? 'تقييم' : summary.total_count === 2 ? 'تقييمين' : summary.total_count <= 10 ? 'تقييمات' : 'تقييماً'}
        </span>
      </div>

      {/* Distribution Bars */}
      <div className="flex-1 w-full flex flex-col gap-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const percent = getPercentage(stars);
          return (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 w-12 text-end flex gap-1 justify-end items-center">
                {stars} <span className="text-yellow-400 text-lg leading-none">★</span>
              </span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden" dir="ltr">
                <div 
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-8" dir="ltr">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
