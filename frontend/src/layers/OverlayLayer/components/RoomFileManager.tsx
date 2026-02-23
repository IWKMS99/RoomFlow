import React from 'react';
import toast from 'react-hot-toast';
import {useTranslation} from 'react-i18next';
import {getApiErrorMessage} from '../../../lib/httpError';
import {useDeleteRoomFileMutation} from '../../../services/hooks/useDeleteRoomFileMutation';
import {useRoomFilesQuery} from '../../../services/hooks/useRoomFilesQuery';
import {useUploadRoomFileMutation} from '../../../services/hooks/useUploadRoomFileMutation';

interface RoomFileManagerProps {
  roomId: string;
}

const RoomFileManager = ({roomId}: RoomFileManagerProps) => {
  const {t} = useTranslation();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const filesQuery = useRoomFilesQuery(roomId, Boolean(roomId));
  const uploadMutation = useUploadRoomFileMutation(roomId);
  const deleteMutation = useDeleteRoomFileMutation(roomId);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync(selectedFile);
      toast.success(t('admin.roomFiles.toast.uploadSuccess'));
      setSelectedFile(null);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t('admin.roomFiles.toast.uploadError')));
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteMutation.mutateAsync(fileId);
      toast.success(t('admin.roomFiles.toast.deleteSuccess'));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t('admin.roomFiles.toast.deleteError')));
    }
  };

  return (
    <section className="mt-3 rounded-xl border border-white/14 bg-background/35 p-3">
      <p className="m-0 text-sm font-semibold text-foreground">{t('admin.roomFiles.title')}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          className="text-xs text-muted-foreground"
        />
        <button
          type="button"
          onClick={() => void handleUpload()}
          disabled={!selectedFile || uploadMutation.isPending}
          className="rounded-md border border-primary/45 bg-primary/25 px-2.5 py-1.5 text-xs font-semibold text-foreground"
        >
          {uploadMutation.isPending ? t('admin.roomFiles.uploading') : t('admin.roomFiles.upload')}
        </button>
      </div>

      <div className="mt-3 grid gap-2">
        {filesQuery.isLoading ? (
          <p className="m-0 text-xs text-muted-foreground">{t('admin.roomFiles.loading')}</p>
        ) : filesQuery.isError ? (
          <p className="m-0 text-xs text-danger">{t('admin.roomFiles.error')}</p>
        ) : (filesQuery.data ?? []).length === 0 ? (
          <p className="m-0 text-xs text-muted-foreground">{t('admin.roomFiles.empty')}</p>
        ) : (
          filesQuery.data?.map((file) => (
            <article key={file.id} className="rounded-lg border border-white/12 bg-card/60 p-2">
              {file.contentType.startsWith('image/') ? (
                <img src={file.url} alt={file.originalName} className="h-28 w-full rounded-md object-cover" />
              ) : (
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-primary underline"
                >
                  {t('admin.roomFiles.openPdf', {name: file.originalName})}
                </a>
              )}
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">{file.originalName}</span>
                <button
                  type="button"
                  onClick={() => void handleDelete(file.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-md border border-danger/45 bg-danger/20 px-2 py-1 text-xs font-semibold text-danger"
                >
                  {t('common.delete')}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default RoomFileManager;
