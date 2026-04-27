import classNames from 'classnames';
import Markdown from 'markdown-to-jsx';

import { Action } from '@/components/atoms';

export default function Footer(props) {
    const { primaryLinks = [], contacts, copyrightText, styles = {} } = props;
    const footerWidth = styles.self?.width ?? 'narrow';

    return (
        <footer className={classNames('relative', styles.self?.padding ?? 'py-10 px-4')}>
            <div
                className={classNames('border-t border-current/30 pt-6', {
                    'max-w-7xl mx-auto': footerWidth === 'narrow',
                    'max-w-8xl mx-auto': footerWidth === 'wide'
                })}
            >
                <div className="flex flex-col gap-5">
                    {primaryLinks.length > 0 && (
                        <nav aria-label="Footer navigation">
                            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm md:text-base">
                                {primaryLinks.map((link, index) => (
                                    <li key={index}>
                                        <Action {...link} />
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}

                    {contacts && <Contacts {...contacts} copyrightText={copyrightText} />}

                    {copyrightText && !contacts && <CopyrightText text={copyrightText} />}
                </div>
            </div>
        </footer>
    );
}

function Contacts(props) {
    const { phoneNumber, phoneAltText, email, emailAltText, address, addressAltText, elementId, copyrightText } = props;

    return (
        <div id={elementId || null} className="flex flex-col gap-2 text-sm md:text-base">
            {phoneNumber && (
                <a href={`tel:${phoneNumber}`} aria-label={phoneAltText} className="w-fit">
                    {phoneNumber}
                </a>
            )}

            {email && (
                <a href={`mailto:${email}`} aria-label={emailAltText} className="w-fit">
                    {email}
                </a>
            )}

            {(address || copyrightText) && (
                <div className="flex items-center justify-between gap-4">
                    {address && (
                        <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
                            aria-label={addressAltText}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-fit"
                        >
                            {address}
                        </a>
                    )}

                    {copyrightText && (
                        <div className="ml-auto text-right">
                            <CopyrightText text={copyrightText} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CopyrightText({ text }) {
    return (
        <Markdown
            options={{ forceInline: true, forceWrapper: true, wrapper: 'p' }}
            className="tracking-widest prose-sm prose uppercase opacity-70"
        >
            {text}
        </Markdown>
    );
}
