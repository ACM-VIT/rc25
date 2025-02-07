import React from 'react';

function SmallViewportWrapper({children}: { children: React.ReactNode }) {
    return (
        <>
            <div className="fixed flex lg:hidden min-h-screen items-center justify-center h-dvh w-screen">
                <h1 className="text-white font-semibold text-lg w-[70%] text-center">
                    Oops! It looks like you&apos;re using a small screen. Kindly switch to a larger screen to view this page.
                </h1>
            </div>
            {/*<div className="hidden lg:flex min-h-screen items-center justify-center">*/}
                {children}
            {/*</div>*/}
        </>
    );
}

export default SmallViewportWrapper;