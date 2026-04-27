import classNames from 'classnames';

import { Annotated } from '@/components/Annotated';
import { iconMap } from '@/components/svgs';
import Link from '../Link';

export default function Social(props) {
    const { elementId, className, label, altText, url, icon = 'facebook' } = props;
    const IconComponent = iconMap[icon];

    const isExternal = url?.startsWith('http');

    return (
        <Annotated content={props}>
            <Link
                href={url}
                aria-label={altText || label}
                id={elementId || null}
                className={classNames('inline-flex items-center justify-center no-underline', className)}
                {...(isExternal && {
                    target: '_blank',
                    rel: 'noopener noreferrer'
                })}
            >
                {label && <span className="sr-only">{label}</span>}
                {IconComponent && <IconComponent className="fill-current w-icon h-icon" />}
            </Link>
        </Annotated>
    );
}
