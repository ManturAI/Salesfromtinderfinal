'use client';

import GradientButton from "@/components/ui/button-1";

const DemoOne = () => {
  return (
    <div className="flex w-full h-screen justify-center items-center">
      <GradientButton
        onClick={() => console.log('clicked')}
        width="300px"
        height="60px"
        disabled={false}
      >
        Button
      </GradientButton>
    </div>
  );
};

export { DemoOne };