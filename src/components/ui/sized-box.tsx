
import React from "react";
import { cn } from "@/lib/utils"; // ShadCN's classnames utility (optional but recommended)

type SizedBoxProps = React.HTMLAttributes<HTMLDivElement>;

export const SizedBox = ({ className, ...props }: SizedBoxProps) => {
    return <div className={cn(className)} {...props} />;
};
