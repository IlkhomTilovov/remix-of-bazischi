import { SVGProps } from 'react';

export function TelegramIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M21.426 2.252a1.5 1.5 0 0 0-1.59-.232L2.36 9.52a1.5 1.5 0 0 0 .12 2.79l4.39 1.47 2.41 7.22a1.5 1.5 0 0 0 2.49.6l2.62-2.43 4.51 3.31a1.5 1.5 0 0 0 2.36-.94l3.13-16.5a1.5 1.5 0 0 0-.964-1.788ZM9.86 14.36l-.7 4.55-1.84-5.5 9.79-7.06-7.25 8.01Z" />
    </svg>
  );
}
