-- Starter catalog (runs only when services table is empty)
insert into public.services (title, description, price_type)
select title, description, price_type
from (
  values
    ('Tax residency & compliance', 'Section 6 residency tracking, filings, and advisory for NRIs.', 'custom'),
    ('Property concierge', 'On-ground inspections, documentation, and coordination with Indian counsel.', 'custom'),
    ('Legal documentation vault', 'Secure storage, verification, and managed releases for deeds, PAN, and titles.', 'fixed'),
    ('Repatriation desk', 'Bank branch coordination and RBI-aligned repatriation workflows.', 'custom')
) as seed (title, description, price_type)
where not exists (select 1 from public.services);
