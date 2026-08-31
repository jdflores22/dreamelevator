interface CompanyBrandTextProps {
  companyName: string;
  tagline: string;
  nameColor: string;
  accentColor: string;
  taglineColor: string;
}

export function CompanyBrandText({
  companyName,
  tagline,
  nameColor,
  accentColor,
  taglineColor,
}: CompanyBrandTextProps) {
  const nameParts = companyName.includes('-') ? companyName.split('-') : null;
  const words = companyName.trim().split(/\s+/).filter(Boolean);
  const compactName = words[0] ?? companyName;
  const useCompact = words.length > 2;

  const fullName = nameParts ? (
    <>
      {nameParts[0]}-
      <span style={{ color: accentColor }}>{nameParts.slice(1).join('-')}</span>
    </>
  ) : (
    companyName
  );

  return (
    <div className="min-w-0 leading-tight">
      <span className="block truncate text-sm font-medium tracking-wide sm:text-base" style={{ color: nameColor }}>
        {useCompact ? (
          <>
            <span className="sm:hidden">{compactName}</span>
            <span className="hidden sm:inline">{fullName}</span>
          </>
        ) : (
          fullName
        )}
      </span>
      {tagline ? (
        <span
          className="hidden truncate text-[10px] font-medium uppercase tracking-wider sm:block"
          style={{ color: taglineColor }}
        >
          {tagline}
        </span>
      ) : null}
    </div>
  );
}
