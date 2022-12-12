import type {
	ErrorBoundaryComponent,
	LinksFunction,
	MetaFunction,
} from '@remix-run/cloudflare';
import {
	Link,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
} from '@remix-run/react';
import type { CatchBoundaryComponent } from '@remix-run/react/dist/routeModules';
import styles from '~/styles/generated-do-not-edit.css';

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'AI-rish Tunes',
	viewport: 'width=device-width,initial-scale=1',
	'theme-color': '#101827',
});

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: styles },
	{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
	{
		rel: 'icon',
		type: 'image/png',
		sizes: '32x32',
		href: '/favicon-32x32.png',
	},
	{
		rel: 'icon',
		type: 'image/png',
		sizes: '16x16',
		href: '/favicon-16x16.png',
	},
	{ rel: 'manifest', href: '/site.webmanifest' },
];

export default function App() {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<div className="flex w-full flex-col items-center">
					<div className="flex w-full flex-col items-center lg:max-w-lg space-y-8 py-8 px-4">
						<div className="flex flex-col items-center text-center">
							<h1>AI-rish Tunes</h1>
							<span className="text-gray-400">
								Every day I pick a random Irish tune and ask an AI to illustrate
								it.
							</span>
						</div>

						<Outlet />

						<p className="text-sm text-gray-400">
							Made by{' '}
							<a href="https://dangurney.net" className="text-gray-400">
								Dan Gurney
							</a>{' '}
							•{' '}
							<a
								href="https://github.com/dgurns/airish-tunes"
								className="text-gray-400"
							>
								Source Code
							</a>
						</p>
					</div>
				</div>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<div className="flex flex-col items-center justify-start w-full h-screen">
					<div className="flex w-full md:max-w-md h-screen md:h-auto flex-col items-center text-center justify-start py-8 px-4">
						Oops! There was an error:
						<span className="text-red-500 mb-6">{error.message}</span>
						<Link to="/">Go to homepage</Link>
					</div>
				</div>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
};

export const CatchBoundary: CatchBoundaryComponent = () => {
	const caught = useCatch();
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				<div className="flex flex-col items-center justify-start w-full h-screen">
					<div className="flex w-full md:max-w-md h-screen md:h-auto flex-col items-center text-center justify-start py-8 px-4">
						Oops! There was an error:
						<span className="text-red-500 mb-6">
							{caught.status} - {caught.statusText}
						</span>
						<Link to="/">Go to homepage</Link>
					</div>
				</div>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
};
