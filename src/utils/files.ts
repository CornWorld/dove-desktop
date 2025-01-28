interface LinkFile extends File {
    type: 'link';
    url: string;
}

export interface File {
    name: string;
    icon: string;
    type: string;
}

const createFile = (name: string, icon: string, type: string): File => ({ name, icon, type });
const createLinkFile = (name: string, icon: string, url: string): LinkFile => ({ name, icon, type: 'link', url });

export const exampleDesktopFiles: File[] = [
    createFile('Home', '/icons/places/folder-activities.svg', 'folder'),
    createLinkFile('Trash', '/icons/places/user-trash.svg', '~/.local/share/Trash'),
];