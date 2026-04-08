# Issue #9 Analysis: Admin Layout Framework

## Overview
Create admin layout components with MLB styling.

## Work Streams

### Stream A: Admin Layout (Single Stream)
**Files to Create:**
- `frontend/src/components/Layout/Sidebar.tsx`
- `frontend/src/components/Layout/Header.tsx`
- `frontend/src/components/Layout/ContentArea.tsx`
- `frontend/src/components/Layout/index.tsx`

**Implementation Details:**
1. Sidebar:
   - Fixed 240px width
   - MLB Navy background (#041E42)
   - Will contain Navigation component
   - Collapsible on mobile

2. Header:
   - 64px height
   - White background with shadow
   - User info and logout button (placeholder)

3. ContentArea:
   - Flexible height
   - Light gray background (#F5F7FA)
   - Scrollable content
   - Padding 24px

4. Layout structure:
   ```tsx
   <div className="flex h-screen">
     <Sidebar />
     <div className="flex-1 flex flex-col ml-60">
       <Header />
       <ContentArea>{children}</ContentArea>
     </div>
   </div>
   ```

**Parallel Streams:** 1

## Dependencies
- Issue #7 (React + Vite) - COMPLETED (or in progress)
- Issue #8 (Tailwind) - COMPLETED (or in progress)

## Definition of Done
- [ ] Sidebar renders with MLB Navy background
- [ ] Header displays at top
- [ ] ContentArea is scrollable
- [ ] Layout is responsive
- [ ] Components composed correctly
