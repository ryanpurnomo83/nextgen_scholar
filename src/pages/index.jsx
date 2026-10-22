import { useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';

export default function Index(){
    const { route } = useLocation();
    useEffect(() => {
        route('/main', true)
    }, []);

    return null;
}