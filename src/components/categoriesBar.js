import styles from "../styles/categories.module.css";
import Link from 'next/link';

export default function CategoriesBar({ tags }) {
    return (
        <div className={styles.contentCatBar}>
            <nav>
                {tags.map((tag, index) => (
                    <li key={index}>
                        <Link href={`/tag/${tag.title}`}>#{tag.title}</Link>
                    </li>
                ))}
            </nav>
        </div>
    );
}