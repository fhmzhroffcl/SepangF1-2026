import React from 'react';
// Text panels use a single responsive surface. Refractive layers belong on
// small controls, not over content whose height changes after an API response.
export default function GlassSurface({children,className='',...props}){
 return <div className={'glass-surface '+className} {...props}><div className="glass-content">{children}</div></div>;
}
