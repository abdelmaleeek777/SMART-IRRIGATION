// import { AnimatePresence, motion } from 'framer-motion';
// import { Building2, Check, MailCheck, MapPin, User } from 'lucide-react';

// const steps = [
//   'Personal Information',
//   'Email Verification',
//   'Exploitation Information',
//   'Parcel Information',
// ];

// const stepIcons = [User, MailCheck, Building2, MapPin];

// const shortLabels = ['Personal', 'Email', 'Exploit.', 'Parcel'];

// export default function StepIndicator({ currentStep = 1 }) {
//   const safeStep = Math.min(Math.max(Number(currentStep) || 1, 1), steps.length);
//   const completedProgress = ((safeStep - 1) / (steps.length - 1)) * 100;

//   return (
//     <section className="w-full max-w-5xl rounded-[2rem] border border-white/80 bg-white/75 px-4 py-5 shadow-[0_18px_60px_rgba(2,48,71,0.08)] backdrop-blur-xl sm:px-6 sm:py-6">

//       <div className="relative mt-5 px-1 sm:px-2">
//         <div className="absolute left-[12.5%] right-[12.5%] top-6 h-1 rounded-full bg-[#CAF0F8] sm:top-7" />

//         <motion.div
//           className="absolute left-[12.5%] top-6 h-1 rounded-full bg-gradient-to-r from-[#0077B6] to-[#00B4D8] shadow-[0_0_18px_rgba(0,180,216,0.25)] sm:top-7"
//           initial={false}
//           animate={{ width: `${completedProgress}%` }}
//           transition={{ type: 'spring', stiffness: 120, damping: 22 }}
//         />

//         <div className="relative grid grid-cols-4 gap-2 sm:gap-4">
//           {steps.map((label, index) => {
//             const stepNumber = index + 1;
//             const Icon = stepIcons[index];
//             const isCompleted = stepNumber < safeStep;
//             const isActive = stepNumber === safeStep;
//             const isUpcoming = stepNumber > safeStep;

//             return (
//               <div key={label} className="flex flex-col items-center text-center">
//                 <motion.div
//                   className={[
//                     'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border sm:h-14 sm:w-14',
//                     isCompleted
//                       ? 'border-[#0077B6] bg-[#0077B6] text-white shadow-[0_14px_28px_rgba(0,119,182,0.22)]'
//                       : isActive
//                         ? 'border-[#00B4D8] bg-[#00B4D8] text-white shadow-[0_0_0_8px_rgba(0,180,216,0.12),0_18px_32px_rgba(0,180,216,0.28)]'
//                         : 'border-[#CAF0F8] bg-[#CAF0F8] text-[#64748B]'
//                   ].join(' ')}
//                   initial={false}
//                   animate={{
//                     scale: isActive ? 1.08 : 1,
//                     y: isActive ? -2 : 0,
//                   }}
//                   transition={{ type: 'spring', stiffness: 260, damping: 18 }}
//                 >
//                   <AnimatePresence mode="wait" initial={false}>
//                     {isCompleted ? (
//                       <motion.span
//                         key="completed"
//                         initial={{ opacity: 0, scale: 0.6, rotate: -18 }}
//                         animate={{ opacity: 1, scale: 1, rotate: 0 }}
//                         exit={{ opacity: 0, scale: 0.7 }}
//                         transition={{ duration: 0.18 }}
//                         className="flex items-center justify-center"
//                       >
//                         <Check className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.75} />
//                       </motion.span>
//                     ) : (
//                       <motion.span
//                         key={stepNumber}
//                         initial={{ opacity: 0, scale: 0.8 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         exit={{ opacity: 0, scale: 0.8 }}
//                         transition={{ duration: 0.18 }}
//                         className="flex items-center justify-center"
//                       >
//                         <Icon className={isUpcoming ? 'h-5 w-5 sm:h-6 sm:w-6' : 'h-5 w-5 sm:h-6 sm:w-6'} strokeWidth={2.2} />
//                       </motion.span>
//                     )}
//                   </AnimatePresence>

//                   {isActive ? (
//                     <span className="absolute inset-0 -z-10 rounded-full bg-[#00B4D8]/20 blur-xl" />
//                   ) : null}
//                 </motion.div>

//                 <div className="mt-3 min-h-[2.5rem] sm:mt-4">
//                   <p
//                     className={[
//                       'hidden text-sm leading-5 sm:block',
//                       isCompleted
//                         ? 'font-medium text-[#023047]'
//                         : isActive
//                           ? 'font-semibold text-[#0077B6]'
//                           : 'text-slate-500',
//                     ].join(' ')}
//                   >
//                     {label}
//                   </p>
//                   <p
//                     className={[
//                       'text-[11px] leading-4 sm:hidden',
//                       isCompleted
//                         ? 'font-medium text-[#023047]'
//                         : isActive
//                           ? 'font-semibold text-[#0077B6]'
//                           : 'text-slate-500',
//                     ].join(' ')}
//                   >
//                     {isActive ? label : shortLabels[index]}
//                   </p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }


import { motion, AnimatePresence } from "framer-motion";

import {
  Building2,
  Check,
  MailCheck,
  MapPin,
  User
} from "lucide-react";


// List of registration steps
const steps = [
  "Personal Information",
  "Email Verification",
  "Exploitation Information",
  "Parcel Information",
];


// Icon corresponding to each step
const stepIcons = [
  User,
  MailCheck,
  Building2,
  MapPin
];


// Short labels for mobile (we will use them later)
const shortLabels = [
  "Personal",
  "Email",
  "Exploit.",
  "Parcel"
];


export default function StepIndicator({ currentStep = 1 }) {

  return (

    // Main container
    <section className="w-full max-w-5xl mx-auto bg-transparent p-4 rounded-3xl shadow-lg">

      {/* Grid containing the 4 steps */}
      <div className="grid grid-cols-4 gap-4">

        {/* Loop through all steps */}
        {steps.map((step, index) => {

          // Get the icon corresponding to this step
          const Icon = stepIcons[index];

          // Convert index (0,1,2,3) to step number (1,2,3,4)
          const stepNumber = index + 1;

          // Check if this step is completed
          const isCompleted = stepNumber < currentStep;

          // Check if this is the active step
          const isActive = stepNumber === currentStep;

          // Check if this step is upcoming
          const isUpcoming = stepNumber > currentStep;


          return (

            // Container for one step
            <div
              key={step}
              className="flex flex-col items-center text-center"
            >

              {/* Circle */}
              <div
                className={`
                  w-10 h-10
                  rounded-full
                  flex items-center justify-center
                  transition-all duration-300

                  ${
                    isCompleted
                      // Completed step
                      ? "bg-[#0077B6] text-white"

                      : isActive
                        // Active step
                        ? "bg-[#00B4D8] text-white shadow-lg scale-110"

                        // Upcoming step
                        : "bg-[#CAF0F8] text-[#64748B]"
                  }
                `}
              >

                {/* Completed = Check icon, otherwise show step icon */}
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}

              </div>


              {/* Step name */}
              <p className="mt-2 text-sm">
                {step}
              </p>

            </div>

          );

        })}

      </div>

    </section>

  );
}