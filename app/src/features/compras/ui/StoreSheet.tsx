import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';

import { ActionSheet, Button, SelectField, TextField } from '@/shared/ui';

import { StoreNameTakenError, createStore, updateStore, type Store } from '../data/storeRepository';
import { COUNTRIES } from '../domain/stores';

type StoreSheetProps = {
  isVisible: boolean;
  // Sem loja, cadastra; com loja, altera nome e país (RF-12).
  store?: { id: string; name: string; countryCode: string | null };
  onClose: () => void;
  onSaved: (store: Store) => void;
};

const NO_COUNTRY = 'NONE';

// Folha de loja: usada em Minhas lojas (T07) e no formulário de compra, sem sair dele (T05).
export function StoreSheet({ isVisible, store, onClose, onSaved }: StoreSheetProps) {
  const db = useSQLiteContext();
  const [name, setName] = useState(store?.name ?? '');
  const [countryCode, setCountryCode] = useState(store?.countryCode ?? NO_COUNTRY);
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  // A folha continua montada depois de fechar; reabrir precisa começar do que está gravado.
  function close() {
    setName(store?.name ?? '');
    setCountryCode(store?.countryCode ?? NO_COUNTRY);
    setError(undefined);
    onClose();
  }

  async function handleSave() {
    if (!name.trim()) return setError('Dê um nome à loja.');
    setIsSaving(true);
    try {
      const input = { name, countryCode: countryCode === NO_COUNTRY ? null : countryCode };
      if (store) {
        await updateStore(db, store.id, input);
        onSaved({ id: store.id, name: name.trim() });
      } else {
        onSaved(await createStore(db, input));
      }
      close();
    } catch (caught) {
      setError(caught instanceof StoreNameTakenError ? 'Você já tem uma loja com esse nome.' : 'Não foi possível salvar. Tente de novo.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ActionSheet isVisible={isVisible} title={store ? 'Editar loja' : 'Nova loja'} onClose={close}>
      <TextField
        label="Nome da loja"
        icon="store"
        value={name}
        onChangeText={(value) => {
          setName(value);
          setError(undefined);
        }}
        error={error}
        autoFocus={!store}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />
      <SelectField
        label="País"
        value={countryCode}
        options={[...COUNTRIES, { value: NO_COUNTRY, label: 'Não informar' }]}
        onChange={setCountryCode}
      />
      <Button label="Salvar loja" isLoading={isSaving} onPress={handleSave} />
    </ActionSheet>
  );
}
